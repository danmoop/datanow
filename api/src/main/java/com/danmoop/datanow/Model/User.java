package com.danmoop.datanow.Model;

import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Document(collection = "users")
@Data
public class User {
  @Id
  private String id;
  private String email;
  private String password;
  private Date createdAt;
  private boolean isPremium;
  private List<FileUpload> fileUploads;
}
