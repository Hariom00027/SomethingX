package com.saarthix.service;

import com.saarthix.model.Resume;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.completion.chat.ChatMessageRole;
import com.theokanning.openai.service.OpenAiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class OpenAIService {

    @Value("${openai.api.key}")
    private String apiKey;

    public String reviewResume(Resume resume) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("your-openai-api-key-here")) {
            throw new RuntimeException("OpenAI API key is not configured");
        }

        try {
            OpenAiService service = new OpenAiService(apiKey, Duration.ofSeconds(60));
            
            String resumeText = convertResumeToText(resume);
            
            // Optimized prompt to minimize tokens
            String systemPrompt = "You are a resume reviewer. Provide a concise, structured review in JSON format: {\"rating\":1-5,\"review\":\"overall assessment\",\"strengths\":[\"strength1\",\"strength2\"],\"weaknesses\":[\"weakness1\",\"weakness2\"],\"suggestions\":[\"suggestion1\",\"suggestion2\"]}. Be specific and actionable.";
            
            String userPrompt = "Review this resume:\n\n" + resumeText + "\n\nProvide structured feedback focusing on content quality, formatting, and ATS compatibility.";
            
            List<ChatMessage> messages = new ArrayList<>();
            messages.add(new ChatMessage(ChatMessageRole.SYSTEM.value(), systemPrompt));
            messages.add(new ChatMessage(ChatMessageRole.USER.value(), userPrompt));
            
            ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model("gpt-3.5-turbo")
                    .messages(messages)
                    .maxTokens(500) // Limit response tokens
                    .temperature(0.7)
                    .build();
            
            String response = service.createChatCompletion(request)
                    .getChoices()
                    .get(0)
                    .getMessage()
                    .getContent();
            
            return response;
        } catch (Exception e) {
            log.error("Error calling OpenAI API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate AI review: " + e.getMessage());
        }
    }

    private String convertResumeToText(Resume resume) {
        StringBuilder sb = new StringBuilder();
        
        // Personal Info - concise
        if (resume.getPersonalInfo() != null) {
            Resume.PersonalInfo info = resume.getPersonalInfo();
            if (info.getFullName() != null) sb.append("Name: ").append(info.getFullName()).append("\n");
            if (info.getTitle() != null) sb.append("Title: ").append(info.getTitle()).append("\n");
            if (info.getEmail() != null) sb.append("Email: ").append(info.getEmail()).append("\n");
            if (info.getPhone() != null) sb.append("Phone: ").append(info.getPhone()).append("\n");
            if (info.getLocation() != null) sb.append("Location: ").append(info.getLocation()).append("\n");
        }
        
        // Summary/Bio - concise
        if (resume.getSummary() != null && !resume.getSummary().trim().isEmpty()) {
            sb.append("\nSummary: ").append(resume.getSummary()).append("\n");
        }
        if (resume.getBio() != null && !resume.getBio().trim().isEmpty()) {
            sb.append("Bio: ").append(resume.getBio()).append("\n");
        }
        
        // Experience - key points only
        if (resume.getExperience() != null && !resume.getExperience().isEmpty()) {
            sb.append("\nExperience:\n");
            for (Resume.Experience exp : resume.getExperience()) {
                if (exp.getRole() != null) sb.append("- ").append(exp.getRole());
                if (exp.getCompany() != null) sb.append(" at ").append(exp.getCompany());
                if (exp.getStartDate() != null || exp.getEndDate() != null) {
                    sb.append(" (").append(exp.getStartDate() != null ? exp.getStartDate() : "").append("-").append(exp.getEndDate() != null ? exp.getEndDate() : "").append(")");
                }
                sb.append("\n");
                if (exp.getAchievements() != null && !exp.getAchievements().isEmpty()) {
                    for (String achievement : exp.getAchievements()) {
                        if (achievement != null && !achievement.trim().isEmpty()) {
                            sb.append("  • ").append(achievement).append("\n");
                        }
                    }
                }
            }
        }
        
        // Education - concise
        if (resume.getEducation() != null && !resume.getEducation().isEmpty()) {
            sb.append("\nEducation:\n");
            for (Resume.Education edu : resume.getEducation()) {
                if (edu.getDegree() != null) sb.append("- ").append(edu.getDegree());
                if (edu.getInstitution() != null) sb.append(" from ").append(edu.getInstitution());
                if (edu.getFieldOfStudy() != null) sb.append(", ").append(edu.getFieldOfStudy());
                sb.append("\n");
            }
        }
        
        // Skills - comma separated
        if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
            sb.append("\nSkills: ").append(String.join(", ", resume.getSkills())).append("\n");
        }
        
        // Projects - key points only
        if (resume.getProjects() != null && !resume.getProjects().isEmpty()) {
            sb.append("\nProjects:\n");
            for (Resume.Project project : resume.getProjects()) {
                if (project.getName() != null) sb.append("- ").append(project.getName());
                if (project.getDescription() != null) sb.append(": ").append(project.getDescription());
                sb.append("\n");
            }
        }
        
        // Certificates - concise
        if (resume.getCertificates() != null && !resume.getCertificates().isEmpty()) {
            sb.append("\nCertificates:\n");
            for (Resume.Certificate cert : resume.getCertificates()) {
                if (cert.getName() != null) sb.append("- ").append(cert.getName());
                if (cert.getIssuer() != null) sb.append(" from ").append(cert.getIssuer());
                sb.append("\n");
            }
        }
        
        return sb.toString();
    }

    public String suggestSectionContent(Resume resume, String sectionName, String currentContent, String userQuestion) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("your-openai-api-key-here")) {
            throw new RuntimeException("OpenAI API key is not configured");
        }

        try {
            OpenAiService service = new OpenAiService(apiKey, Duration.ofSeconds(60));
            
            String resumeContext = convertResumeToText(resume);
            
            // Optimized prompt for section suggestions
            String systemPrompt = "You are a resume writing assistant. Analyze the resume context and suggest appropriate content for the specified section. Provide concise, professional, and relevant suggestions that complement the existing resume content. Return only the suggested text, no explanations.";
            
            String userPrompt;
            if (userQuestion != null && !userQuestion.trim().isEmpty()) {
                // User has provided a specific question/request
                userPrompt = String.format(
                    "Resume Context:\n%s\n\nSection: %s\nCurrent Content: %s\n\nUser Request: %s\n\nBased on the user's request and the resume context, suggest professional content for this section. Be specific and actionable.",
                    resumeContext,
                    sectionName,
                    currentContent != null ? currentContent : "(empty)",
                    userQuestion
                );
            } else {
                // No specific question - auto-fill the section
                userPrompt = String.format(
                    "Resume Context:\n%s\n\nSection: %s\nCurrent Content: %s\n\nSuggest professional content for this section that aligns with the resume. Be specific and actionable.",
                    resumeContext,
                    sectionName,
                    currentContent != null ? currentContent : "(empty)"
                );
            }
            
            List<ChatMessage> messages = new ArrayList<>();
            messages.add(new ChatMessage(ChatMessageRole.SYSTEM.value(), systemPrompt));
            messages.add(new ChatMessage(ChatMessageRole.USER.value(), userPrompt));
            
            ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model("gpt-3.5-turbo")
                    .messages(messages)
                    .maxTokens(300) // Limit response tokens for suggestions
                    .temperature(0.8) // Slightly higher for creativity
                    .build();
            
            String response = service.createChatCompletion(request)
                    .getChoices()
                    .get(0)
                    .getMessage()
                    .getContent();
            
            return response.trim();
        } catch (Exception e) {
            log.error("Error generating section suggestion: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate section suggestion: " + e.getMessage());
        }
    }
}

