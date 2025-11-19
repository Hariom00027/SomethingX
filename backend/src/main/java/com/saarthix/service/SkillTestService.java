package com.saarthix.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.saarthix.model.SkillTest;
import com.saarthix.model.blueprint.Blueprint;
import com.saarthix.repository.SkillTestRepository;
import com.saarthix.repository.blueprint.BlueprintRepository;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.completion.chat.ChatMessageRole;
import com.theokanning.openai.service.OpenAiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
public class SkillTestService {

    private final SkillTestRepository skillTestRepository;
    private final BlueprintRepository blueprintRepository;
    private final RolePreparationService rolePreparationService;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key}")
    private String apiKey;

    public SkillTestService(SkillTestRepository skillTestRepository,
                           BlueprintRepository blueprintRepository,
                           RolePreparationService rolePreparationService,
                           ObjectMapper objectMapper) {
        this.skillTestRepository = skillTestRepository;
        this.blueprintRepository = blueprintRepository;
        this.rolePreparationService = rolePreparationService;
        this.objectMapper = objectMapper;
    }

    public SkillTest startTest(String studentId, String roleName, String skillName) {
        // Check if there's an in-progress test
        Optional<SkillTest> existingTest = skillTestRepository.findByStudentIdAndRoleNameAndSkillNameAndStatus(
                studentId, roleName, skillName, "IN_PROGRESS");
        
        if (existingTest.isPresent()) {
            return existingTest.get();
        }

        // Get role blueprint to understand the role context
        Optional<Blueprint> roleOpt = blueprintRepository.findByNameAndType(roleName, "role");
        if (roleOpt.isEmpty()) {
            throw new RuntimeException("Role not found: " + roleName);
        }

        Blueprint role = roleOpt.get();
        
        // Find the skill requirement to get difficulty and description
        Blueprint.SkillRequirement skillReq = null;
        if (role.getSkillRequirements() != null) {
            for (Blueprint.SkillRequirement req : role.getSkillRequirements()) {
                if (skillName.equals(req.getSkillName())) {
                    skillReq = req;
                    break;
                }
            }
        }

        // Generate questions using OpenAI
        List<SkillTest.Question> questions = generateQuestions(roleName, skillName, skillReq);

        // Create new test
        SkillTest test = new SkillTest();
        test.setStudentId(studentId);
        test.setRoleName(roleName);
        test.setSkillName(skillName);
        test.setQuestions(questions);
        test.setAnswers(new HashMap<>());
        test.setStatus("IN_PROGRESS");
        test.setStartedAt(LocalDateTime.now());

        return skillTestRepository.save(test);
    }

    private List<SkillTest.Question> generateQuestions(String roleName, String skillName, Blueprint.SkillRequirement skillReq) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("your-openai-api-key-here")) {
            throw new RuntimeException("OpenAI API key is not configured");
        }

        try {
            OpenAiService service = new OpenAiService(apiKey, Duration.ofSeconds(60));

            String difficulty = skillReq != null && skillReq.getDifficulty() != null 
                    ? skillReq.getDifficulty() 
                    : "intermediate";
            String skillDescription = skillReq != null && skillReq.getDescription() != null 
                    ? skillReq.getDescription() 
                    : "";

            String systemPrompt = "You are an expert technical interviewer. Generate exactly 15 multiple-choice questions for testing a student's knowledge of a specific skill. " +
                    "The questions should be appropriate for the role and difficulty level. " +
                    "Return ONLY a valid JSON array with this exact structure: " +
                    "[{\"questionText\":\"question here\",\"options\":[\"option1\",\"option2\",\"option3\",\"option4\"],\"correctAnswer\":\"correct option text\"}] " +
                    "Do not include any explanations or markdown formatting, just the JSON array.";

            String userPrompt = String.format(
                    "Generate 15 multiple-choice questions for the skill '%s' in the role '%s'. " +
                    "Difficulty level: %s. " +
                    "Skill description: %s. " +
                    "The questions should test practical knowledge and understanding appropriate for someone preparing for this role. " +
                    "Each question must have exactly 4 options, and the correctAnswer must match one of the options exactly.",
                    skillName, roleName, difficulty, skillDescription
            );

            List<ChatMessage> messages = new ArrayList<>();
            messages.add(new ChatMessage(ChatMessageRole.SYSTEM.value(), systemPrompt));
            messages.add(new ChatMessage(ChatMessageRole.USER.value(), userPrompt));

            ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model("gpt-3.5-turbo")
                    .messages(messages)
                    .maxTokens(2000)
                    .temperature(0.7)
                    .build();

            String response = service.createChatCompletion(request)
                    .getChoices()
                    .get(0)
                    .getMessage()
                    .getContent();

            // Parse JSON response
            String jsonContent = extractJsonFromResponse(response);
            List<Map<String, Object>> questionsData = objectMapper.readValue(
                    jsonContent, 
                    new TypeReference<List<Map<String, Object>>>() {}
            );

            // Convert to Question objects
            List<SkillTest.Question> questions = new ArrayList<>();
            for (int i = 0; i < questionsData.size() && i < 15; i++) {
                Map<String, Object> qData = questionsData.get(i);
                SkillTest.Question question = new SkillTest.Question();
                question.setQuestionNumber(i + 1);
                question.setQuestionText((String) qData.get("questionText"));
                
                @SuppressWarnings("unchecked")
                List<String> options = (List<String>) qData.get("options");
                question.setOptions(options);
                
                question.setCorrectAnswer((String) qData.get("correctAnswer"));
                questions.add(question);
            }

            // Ensure we have exactly 15 questions
            while (questions.size() < 15) {
                SkillTest.Question question = new SkillTest.Question();
                question.setQuestionNumber(questions.size() + 1);
                question.setQuestionText("Question " + (questions.size() + 1) + " - Please contact support.");
                question.setOptions(Arrays.asList("Option A", "Option B", "Option C", "Option D"));
                question.setCorrectAnswer("Option A");
                questions.add(question);
            }

            return questions.subList(0, 15);
        } catch (Exception e) {
            log.error("Error generating questions with OpenAI: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate test questions: " + e.getMessage());
        }
    }

    private String extractJsonFromResponse(String response) {
        // Try to extract JSON array from the response
        response = response.trim();
        
        // Remove markdown code blocks if present
        if (response.startsWith("```json")) {
            response = response.substring(7);
        } else if (response.startsWith("```")) {
            response = response.substring(3);
        }
        if (response.endsWith("```")) {
            response = response.substring(0, response.length() - 3);
        }
        
        response = response.trim();
        
        // Find the first [ and last ]
        int startIdx = response.indexOf('[');
        int endIdx = response.lastIndexOf(']');
        
        if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
            return response.substring(startIdx, endIdx + 1);
        }
        
        return response;
    }

    public SkillTest getTest(String testId) {
        return skillTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found: " + testId));
    }

    public SkillTest getInProgressTest(String studentId, String roleName, String skillName) {
        return skillTestRepository.findByStudentIdAndRoleNameAndSkillNameAndStatus(
                studentId, roleName, skillName, "IN_PROGRESS")
                .orElseThrow(() -> new RuntimeException("No in-progress test found"));
    }

    public SkillTest submitAnswer(String testId, int questionNumber, String answer) {
        SkillTest test = getTest(testId);
        
        if (!"IN_PROGRESS".equals(test.getStatus())) {
            throw new RuntimeException("Test is not in progress");
        }

        test.getAnswers().put(questionNumber, answer);
        return skillTestRepository.save(test);
    }

    public SkillTest submitTest(String testId) {
        SkillTest test = getTest(testId);
        
        if (!"IN_PROGRESS".equals(test.getStatus())) {
            throw new RuntimeException("Test is not in progress");
        }

        // Calculate score
        int correctAnswers = 0;
        int totalQuestions = test.getQuestions().size();

        for (SkillTest.Question question : test.getQuestions()) {
            String userAnswer = test.getAnswers().get(question.getQuestionNumber());
            if (userAnswer != null && userAnswer.trim().equalsIgnoreCase(question.getCorrectAnswer().trim())) {
                correctAnswers++;
            }
        }

        int score = (int) Math.round((correctAnswers * 100.0) / totalQuestions);
        test.setScore(score);
        test.setPassed(score >= 80);
        test.setStatus(test.getPassed() ? "COMPLETED" : "FAILED");
        test.setCompletedAt(LocalDateTime.now());

        // If test is passed, mark skill as completed in RolePreparation
        if (test.getPassed()) {
            try {
                rolePreparationService.markSkillCompletedAfterTest(
                        test.getStudentId(), 
                        test.getRoleName(), 
                        test.getSkillName(), 
                        score
                );
            } catch (Exception e) {
                log.error("Error marking skill as completed after test: {}", e.getMessage(), e);
                // Don't fail the test submission if this fails
            }
        }

        return skillTestRepository.save(test);
    }

    public SkillTest getLatestTestResult(String studentId, String roleName, String skillName) {
        return skillTestRepository.findFirstByStudentIdAndRoleNameAndSkillNameOrderByStartedAtDesc(
                studentId, roleName, skillName)
                .orElse(null);
    }
}

