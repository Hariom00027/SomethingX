package com.saarthix.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "section_templates")
public class SectionTemplate {
    @Id
    private String id;
    private String title;
    private String content;
    private boolean isActive = true;
}

