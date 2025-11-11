package com.saarthix.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "industry_training_notifications")
public class IndustryTrainingNotification {

    @Id
    private String id;

    private String requestId;
    private String companyName;
    private String contactEmail;
    private String contactName;

    private String trainingName;
    private String schedule;
    private String trainingStatus;

    private String subject;
    private String message;

    private String adminContactName;
    private String adminContactEmail;
    private String adminContactPhone;
    private String pricingDetails;
    private String resourceLink;

    private String status = "UNREAD";
    private Instant createdAt = Instant.now();
    private Instant readAt;
}


