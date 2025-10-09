package com.careerconnect.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "jobs")
public class Job {

    @Id
    private String id;
    private String title;
    private String company;
    private String description;
    private String location;
    private List<String> applicants;
}
