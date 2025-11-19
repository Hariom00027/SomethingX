package com.saarthix.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "skill_tests")
public class SkillTest {
    
    @Id
    private String id;
    
    private String studentId;
    private String roleName;
    private String skillName;
    
    private List<Question> questions;
    private Map<Integer, String> answers; // questionIndex -> answer
    private Integer score; // percentage score
    private Boolean passed; // true if score >= 80
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String status; // "IN_PROGRESS", "COMPLETED", "FAILED"
    
    @Data
    public static class Question {
        private String questionText;
        private List<String> options; // Multiple choice options
        private String correctAnswer; // The correct answer
        private Integer questionNumber;
    }
}

