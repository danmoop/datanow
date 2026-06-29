package com.danmoop.datanow.Service;

import com.danmoop.datanow.Cache.AnalyzeFileCache;
import com.danmoop.datanow.Cache.TrendsFileCache;
import com.danmoop.datanow.Middleware.Middleware;
import com.danmoop.datanow.Model.FileUpload;
import com.danmoop.datanow.Model.User;
import com.danmoop.datanow.Repository.FileUploadRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;

import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import org.apache.commons.io.FilenameUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

@Service
public class AnalyzeService {
  private final AnalyzeFileCache analyzeFileCache;
  private final TrendsFileCache trendsFileCache;
  private final FileService fileService;
  private final FileUploadRepository fileUploadRepository;
  private final OllamaChatModel ollamaChatClient;
  private final Middleware middleware;
  private final S3Client s3Client;
  private final PDFTextStripper pdfTextStripper;

  private final String ANALYZE_PROMPT;
  private final String TRENDS_PROMPT;

  @Value("${minio.bucket}")
  private String bucket;

  public AnalyzeService(AnalyzeFileCache analyzeFileCache, TrendsFileCache trendsFileCache, FileService fileService,
      FileUploadRepository fileUploadRepository, OllamaChatModel ollamaChatClient, Middleware middleware,
      S3Client s3Client) throws IOException {
    this.analyzeFileCache = analyzeFileCache;
    this.trendsFileCache = trendsFileCache;
    this.fileService = fileService;
    this.fileUploadRepository = fileUploadRepository;
    this.ollamaChatClient = ollamaChatClient;
    this.middleware = middleware;
    this.s3Client = s3Client;
    this.pdfTextStripper = new PDFTextStripper();

    this.ANALYZE_PROMPT = new String(
        new ClassPathResource("prompts/summarize.md")
            .getInputStream()
            .readAllBytes(),
        StandardCharsets.UTF_8);

    this.TRENDS_PROMPT = new String(
        new ClassPathResource("prompts/trends.md")
            .getInputStream()
            .readAllBytes(),
        StandardCharsets.UTF_8);
  }

  public String analyze(User user, String key) throws Exception {
    Optional<String> cachedValue = analyzeFileCache.get(key);

    if (cachedValue.isPresent()) {
      return cachedValue.get();
    }

    middleware.analyzeRateLimiter(user);

    String fileContents = readFile(user, key);
    String aiResponse = callLLM(ANALYZE_PROMPT, fileContents);

    analyzeFileCache.set(key, aiResponse);

    return aiResponse;
  }

  public String trends(User user, String key) throws Exception {
    Optional<String> cachedValue = trendsFileCache.get(key);

    if (cachedValue.isPresent()) {
      return cachedValue.get();
    }

    middleware.analyzeRateLimiter(user);

    String fileContents = readFile(user, key);
    String aiResponse = callLLM(TRENDS_PROMPT, fileContents);

    trendsFileCache.set(key, aiResponse);

    return aiResponse;
  }

  private String readFile(User user, String key) throws Exception {
    if (!fileService.exists(key)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
    }

    FileUpload fileDB = fileUploadRepository.findByStorageKey(key)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

    if (!fileDB.getUserId().equals(user.getId())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You do not have permission to analyze this file");
    }

    GetObjectRequest request = GetObjectRequest.builder()
        .bucket(bucket)
        .key(key)
        .build();

    String extension = FilenameUtils.getExtension(key).toLowerCase();

    try (ResponseInputStream<GetObjectResponse> inputStream = s3Client.getObject(request)) {
      byte[] bytes = inputStream.readAllBytes();

      switch (extension.toLowerCase()) {
        case "csv":
        case "json":
          return new String(bytes, StandardCharsets.UTF_8);

        case "pdf":
          try (PDDocument document = PDDocument.load(bytes)) {
            return pdfTextStripper.getText(document);
          }

        default:
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported file type: " + extension);
      }
    }
  }

  private String callLLM(String systemPrompt, String userContent) {
    SystemMessage generalInstructionsSystemMessage = new SystemMessage(systemPrompt);
    UserMessage currentPromptMessage = new UserMessage(userContent);

    Prompt prompt = new Prompt(List.of(generalInstructionsSystemMessage, currentPromptMessage));

    ChatResponse response = ollamaChatClient.call(prompt);

    Generation result = response.getResult();

    if (result == null) {
      return "No LLM Response";
    }

    return result.toString();
  }
}
