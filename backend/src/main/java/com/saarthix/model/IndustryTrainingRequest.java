package com.saarthix.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Document(collection = "industry_training_requests")
public class IndustryTrainingRequest {

    @Id
    private String id;

    private String trainingId;
    private String trainingRoleName;
    private String requestType; // EXISTING or CUSTOM

    private String companyName;
    private String companyWebsite;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String industryContactNumber;

    private Integer numberOfCandidates;
    private String preferredStartDate;

    private String customRoleName;
    private String customRequirements;
    private List<String> desiredSkills;

    private String exampleCompany;
    private String specificRole;
    private String targetIndustry;
    private String packageAfterSelection;
    private String stipendDetails;
    private String otherRequirements;

    private String additionalNotes;

    private String status = "PENDING";
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    private String adminPricingDetails;
    private String adminContactName;
    private String adminContactEmail;
    private String adminContactPhone;
    private String adminMessage;
    private String adminResourceLink;
    private String adminSchedule;
    private Instant adminRespondedAt;

    private Boolean notificationSent = Boolean.FALSE;
    private Instant notificationSentAt;
}

