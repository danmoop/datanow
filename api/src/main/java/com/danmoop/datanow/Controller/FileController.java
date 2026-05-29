package com.danmoop.datanow.Controller;

import com.danmoop.datanow.Annotation.Authenticated;
import com.danmoop.datanow.Model.User;
import com.danmoop.datanow.Service.FileService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/files")
public class FileController {

  private final FileService fileService;

  public FileController(FileService fileService) {
    this.fileService = fileService;
  }

  @Authenticated
  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<Map<String, String>> uploadFile(@RequestPart("file") MultipartFile file, HttpServletRequest request) throws Exception {
    User user = (User) request.getAttribute("user");

    fileService.upload(file, user);
    return ResponseEntity.ok(Map.of("message", "File uploaded successfully"));
  }

  @Authenticated
  @GetMapping("/exists/{filename}")
  public boolean exists(@PathVariable String filename) {
    return fileService.exists(filename);
  }

  @Authenticated
  @GetMapping("/download")
  public byte[] downloadFile(@RequestParam String key) throws IOException {
    return fileService.download(key);
  }

  @Authenticated
  @DeleteMapping
  public ResponseEntity<Map<String, String>> deleteFile(@RequestParam String key, HttpServletRequest request) {
    User user = (User) request.getAttribute("user");

    fileService.delete(key, user);
    return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
  }
}
