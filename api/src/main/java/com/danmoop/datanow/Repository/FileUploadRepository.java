package com.danmoop.datanow.Repository;


import com.danmoop.datanow.Model.FileUpload;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FileUploadRepository extends MongoRepository<FileUpload, String> {
  Optional<FileUpload> findByStorageKey(String storageKey);
}
