package com.saarthix.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.saarthix.model.ExpertSession;
import com.saarthix.repository.ExpertSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpertSessionInitializationService implements CommandLineRunner {

    private final ExpertSessionRepository expertSessionRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        initializeExpertSessions();
    }

    private void initializeExpertSessions() {
        try {
            // Clear existing expert sessions before seeding
            long existingCount = expertSessionRepository.count();
            if (existingCount > 0) {
                expertSessionRepository.deleteAll();
                System.out.printf("Cleared %d existing expert sessions.%n", existingCount);
            }

            var resource = new ClassPathResource("expert-sessions.json");
            if (!resource.exists()) {
                System.out.println("expert-sessions.json not found. Skipping expert session seeding.");
                return;
            }

            try (InputStream inputStream = resource.getInputStream()) {
                List<ExpertSession> experts = objectMapper.readValue(
                        inputStream,
                        new TypeReference<List<ExpertSession>>() {
                        }
                );
                expertSessionRepository.saveAll(experts);
                System.out.printf("Seeded %d expert sessions.%n", experts.size());
            }
        } catch (Exception ex) {
            System.err.println("Failed to seed expert sessions: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
}


