package com.danmoop.datanow.Service;

import com.danmoop.datanow.Cache.AnalyzeFileCache;
import com.danmoop.datanow.Cache.TrendsFileCache;
import com.danmoop.datanow.Model.FileUpload;
import com.danmoop.datanow.Model.User;
import com.danmoop.datanow.Repository.FileUploadRepository;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class AnalyzeService {
  private final AnalyzeFileCache analyzeFileCache;
  private final TrendsFileCache trendsFileCache;
  private final FileService fileService;
  private final FileUploadRepository fileUploadRepository;
  private final OllamaChatModel ollamaChatClient;

  public AnalyzeService(AnalyzeFileCache analyzeFileCache, TrendsFileCache trendsFileCache, FileService fileService,
      FileUploadRepository fileUploadRepository, OllamaChatModel ollamaChatClient) {
    this.analyzeFileCache = analyzeFileCache;
    this.trendsFileCache = trendsFileCache;
    this.fileService = fileService;
    this.fileUploadRepository = fileUploadRepository;
    this.ollamaChatClient = ollamaChatClient;
  }

  public String analyze(User user, String key) {
    Optional<String> cachedValue = analyzeFileCache.get(key);

    if (cachedValue.isPresent()) {
      return cachedValue.get();
    }

    // TODO: implement rate limiter

    return key;
  }

  public String trends(String key) {
    Optional<String> cachedValue = trendsFileCache.get(key);

    if (cachedValue.isPresent()) {
      return cachedValue.get();
    }

    return key;
  }

  private String resolveFile(User user, String key) {
    if (!fileService.exists(key)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
    }

    FileUpload fileDB = fileUploadRepository.findByStorageKey(key)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

    if (!fileDB.getUserId().equals(user.getId())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You do not have permission to analyze this file");
    }

    return key;
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
