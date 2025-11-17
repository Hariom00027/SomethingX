package com.saarthix.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "institute_expert_session_enrollments")
public class InstituteExpertSessionEnrollment {

    @Id
    private String id;

    private String expertSessionId;
    private String expertNameSnapshot;

    private String instituteName;
    private String place;
    private String contactNumber;
    private String email;
    private String contactPersonName;
    private String contactPersonDesignation;
    private String preferredMode; // Online / Offline
    private String preferredDate; // ISO date string
    private String preferredTime; // HH:mm
    private Integer expectedParticipantCount;
    private String additionalNotes;

    private Instant submittedAt = Instant.now();
}

