package com.danmoop.datanow.Model;

import lombok.Data;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "fileUpload")
@Data
@ToString
public class FileUpload {
  private final String userId;
  private final String filename;
  private final String storageKey;
  private final String fileType;
  private final long fileSizeBytes;
  private final Date uploadedAt;
  @Id
  private String id;

  public FileUpload(String userId, String filename, String fileType, String storageKey, long fileSizeBytes,
                    Date uploadedAt) {
    this.userId = userId;
    this.filename = filename;
    this.fileType = fileType;
    this.storageKey = storageKey;
    this.fileSizeBytes = fileSizeBytes;
    this.uploadedAt = uploadedAt;
  }
}
