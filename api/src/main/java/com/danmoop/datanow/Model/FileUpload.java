package com.danmoop.datanow.Model;

import lombok.ToString;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

enum FileType {
  CSV,
  PDF,
  JSON
}

@Document(collection = "fileUpload")
@ToString
public class FileUpload {
  private ObjectId userId;
  private String filename;
  private FileType fileType;
  private int fileSizeBytes;
  private Date uploadedAt;
}
