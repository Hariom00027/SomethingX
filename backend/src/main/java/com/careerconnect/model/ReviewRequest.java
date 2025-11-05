package com.careerconnect.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "review_requests")
public class ReviewRequest {
    @Id
    private String id;
    private String resumeId;
    private String studentId;
    private String type; // AI or HUMAN
    private String status; // PENDING, ACCEPTED, REJECTED, COMPLETED
    private String feedback; // populated when completed (for AI reviews)
    
    // Mentor review fields
    private String mentorId;
    private Integer rating; // 1-5 stars
    private String review; // Detailed review text
    private String suggestions; // Suggestions for improvement
    private String others; // Additional comments
    private Instant requestedAt;
    private Instant reviewedAt;
}


