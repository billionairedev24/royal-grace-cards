package com.royalgrace.cards.controller;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Value("${upload.path:uploads}")
    private String uploadPath;

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @PostMapping
    public ResponseEntity<?> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        List<String> uploadedUrls = new ArrayList<>();

        try {
            Path root = Paths.get(uploadPath);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Files.copy(file.getInputStream(), root.resolve(filename));
                
                // Return the URL that will be served by Spring
                uploadedUrls.add(baseUrl + "/uploads/" + filename);
            }

            return ResponseEntity.ok(new UploadResponse(uploadedUrls));
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Could not upload the files: " + e.getMessage());
        }
    }

    @Setter
    @Getter
    private static class UploadResponse {
        private List<String> urls;

        public UploadResponse(List<String> urls) {
            this.urls = urls;
        }

    }
}
