package com.danmoop.datanow.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

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
