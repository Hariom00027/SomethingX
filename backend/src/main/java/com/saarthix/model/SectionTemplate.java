package com.saarthix.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "section_templates")
public class SectionTemplate {
    @Id
    private String id;
    private String title;
    private String contentType; // "text" or "list"
    private String content; // For text type
    private List<String> items; // For list type
    private String icon; // Emoji or icon identifier
    private String color; // CSS color class
    private boolean isActive = true;
}

