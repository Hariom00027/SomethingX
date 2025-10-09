package com.careerconnect.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "resume_templates")
public class ResumeTemplate {
    @Id
    private String id;
    private String name;
    private String description;
    private String category; // "professional", "creative", "academic"
    private String previewUrl;
    private String html; // HTML template with {{placeholders}}
    private String css; // CSS styles for colors and formatting
    private List<String> sections; // Available sections
    private boolean isActive;
    private String primaryColor;
    private String secondaryColor;
    private String accentColor;
}


