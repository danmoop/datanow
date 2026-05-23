package com.danmoop.datanow.Controller;

import com.danmoop.datanow.Annotation.Authenticated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/files")
public class FileController {

  @Authenticated
  @PostMapping("/upload")
  public String uploadFile() {
    return "File uploaded successfully";
  }

  @Authenticated
  @GetMapping("/exists/{filename}")
  public boolean exists(@PathVariable String filename) {
    return true;
  }

  @Authenticated
  @GetMapping("/download")
  public Object downloadFile() {
    return null;
  }

  @Authenticated
  @DeleteMapping("/")
  public String deleteFile() {
    return "File deleted successfully";
  }
}
