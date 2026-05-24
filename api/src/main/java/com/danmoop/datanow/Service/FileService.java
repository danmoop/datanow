package com.danmoop.datanow.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;

@Service
public class FileService {

  private final S3Client s3Client;
  @Value("${minio.bucket}")
  private String bucket;

  public FileService(S3Client s3Client) {
    this.s3Client = s3Client;
  }

  public void upload(MultipartFile file) throws IOException {
    s3Client.putObject(
      PutObjectRequest.builder()
        .bucket(bucket)
        .key(file.getOriginalFilename())
        .contentType(file.getContentType())
        .build(),
      RequestBody.fromBytes(file.getBytes())
    );
  }

  public boolean exists(String filename) {
    try {
      s3Client.headObject(HeadObjectRequest.builder()
        .bucket(bucket)
        .key(filename)
        .build());
      return true;
    } catch (NoSuchKeyException e) {
      return false;
    }
  }

  public byte[] download(String filename) throws IOException {
    ResponseInputStream<GetObjectResponse> response = s3Client.getObject(
      GetObjectRequest.builder()
        .bucket(bucket)
        .key(filename)
        .build()
    );
    return response.readAllBytes();
  }
}
