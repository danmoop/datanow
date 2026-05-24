package com.danmoop.datanow.Controller;

import com.danmoop.datanow.Annotation.Authenticated;
import com.danmoop.datanow.Model.User;
import com.danmoop.datanow.Service.FileService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/files")
public class FileController {

  private final FileService fileService;

  public FileController(FileService fileService) {
    this.fileService = fileService;
  }

  @Authenticated
  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public String uploadFile(@RequestPart("file") MultipartFile file, HttpServletRequest request) throws IOException {
    User user = (User) request.getAttribute("user");

    fileService.upload(file);
    return "File uploaded successfully";
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
  @DeleteMapping("/")
  public String deleteFile() {
    return "File deleted successfully";
  }
}
