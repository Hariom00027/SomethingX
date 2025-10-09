package com.careerconnect.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "review_requests")
public class ReviewRequest {
    @Id
    private String id;
    private String resumeId;
    private String type; // AI or HUMAN
    private String status; // PENDING, COMPLETED
    private String feedback; // populated when completed
}


