package com.saarthix.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "industryPostings")
public class IndustryPosting {

    @Id
    private String id;
    private String company;
    private String jobTitle;
    private String description;
    private List<String> hackathons;
}
