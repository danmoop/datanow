package com.danmoop.datanow.Service;

import com.danmoop.datanow.Model.FileUpload;
import com.danmoop.datanow.Model.User;
import com.danmoop.datanow.Repository.FileUploadRepository;
import com.danmoop.datanow.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.Date;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileService {

  private final S3Client s3Client;
  private final FileUploadRepository fileUploadRepository;
  private final UserRepository userRepository;

  @Value("${minio.bucket}")
  private String bucket;

  public FileService(S3Client s3Client, FileUploadRepository fileUploadRepository, UserRepository userRepository) {
    this.s3Client = s3Client;
    this.fileUploadRepository = fileUploadRepository;
    this.userRepository = userRepository;
  }

  public void upload(MultipartFile file, User user) throws IOException {
    if (!user.isPremium() && file.getSize() > 5 * 1024 * 1024) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size exceeds the 5MB limit for free users");
    }
    if (file.getSize() > 50 * 1024 * 1024) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size exceeds the 50MB limit");
    }

    String userId = user.getId();
    String fileId = UUID.randomUUID().toString();

    String[] parts = Objects.requireNonNull(file.getOriginalFilename()).split("\\.");
    String fileType = parts[parts.length - 1];
    String storageKey = userId + "/" + fileId + "." + fileType;

    s3Client.putObject(
      PutObjectRequest.builder()
        .bucket(bucket)
        .key(storageKey)
        .contentType(file.getContentType())
        .build(),
      RequestBody.fromBytes(file.getBytes())
    );

    FileUpload fileUpload = new FileUpload(userId, file.getOriginalFilename(), fileType, storageKey, file.getSize(), new Date());

    System.out.println(fileUpload);

    fileUploadRepository.save(fileUpload);

    User userDB = userRepository.findByEmail(user.getEmail()).orElseThrow(() ->
      new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
    );
    userDB.getFileUploads().add(fileUpload);
    userRepository.save(userDB);
  }

  public byte[] download(String storageKey) throws IOException {
    ResponseInputStream<GetObjectResponse> response = s3Client.getObject(
      GetObjectRequest.builder()
        .bucket(bucket)
        .key(storageKey)
        .build()
    );
    return response.readAllBytes();
  }

  public void delete(String storageKey, User user) {
    if (!exists(storageKey)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File does not exist");
    }

    FileUpload dbFileupload = fileUploadRepository.findByStorageKey(storageKey).orElseThrow(() ->
      new ResponseStatusException(HttpStatus.NOT_FOUND, "File metadata not found in database")
    );

    if (!dbFileupload.getUserId().equals(user.getId())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized to delete this file");
    }

    s3Client.deleteObject(DeleteObjectRequest.builder()
      .bucket(bucket)
      .key(storageKey)
      .build());

    User userDB = userRepository.findByEmail(user.getEmail()).orElseThrow(() ->
      new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
    );

    userDB.getFileUploads().remove(dbFileupload);
    userRepository.save(userDB);
    fileUploadRepository.delete(dbFileupload);
  }

  public boolean exists(String storageKey) {
    try {
      s3Client.headObject(HeadObjectRequest.builder()
        .bucket(bucket)
        .key(storageKey)
        .build());
      return true;
    } catch (NoSuchKeyException e) {
      return false;
    }
  }
}
