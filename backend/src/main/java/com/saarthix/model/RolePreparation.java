package com.saarthix.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Document(collection = "role_preparations")
public class RolePreparation {
    
    @Id
    private String id;
    
    private String studentId; // User ID of the student
    private String roleName; // Name of the role being prepared for
    
    private LocalDate preparationStartDate; // Date when preparation was started
    private LocalDate targetCompletionDate; // Target date from the plan
    
    // Map of skill name to completion status and date
    // Key: skillName, Value: Map with "completed" (boolean), "completedDate" (LocalDate)
    private Map<String, SkillProgress> skillProgress;
    
    // Overall preparation status
    private boolean isActive; // Whether preparation is currently active
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    public static class SkillProgress {
        private boolean completed;
        private LocalDate completedDate;
        private LocalDate targetDate; // Target date for this skill from the plan
        private Integer score; // Test score (0-100) if test was taken
        
        public SkillProgress() {
            this.completed = false;
        }
        
        public SkillProgress(boolean completed, LocalDate completedDate, LocalDate targetDate) {
            this.completed = completed;
            this.completedDate = completedDate;
            this.targetDate = targetDate;
        }
        
        public SkillProgress(boolean completed, LocalDate completedDate, LocalDate targetDate, Integer score) {
            this.completed = completed;
            this.completedDate = completedDate;
            this.targetDate = targetDate;
            this.score = score;
        }
    }
}

