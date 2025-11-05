package com.careerconnect.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Document(collection = "training_enrollments")
public class TrainingEnrollment {

    @Id
    private String id;

    private String trainingId;
    private String trainingRoleName;

    // Student personal info
    private String fullName;
    private String email;
    private String phone;
    private String gender;
    private String dateOfBirth; // ISO string (client-side formatted)

    // Address
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;

    // Education
    private String highestQualification; // e.g., B.Tech, B.Com
    private String specialization;
    private String collegeName;
    private String graduationYear;
    private double percentageOrCgpa;

    // Experience & skills (optional)
    private int yearsOfExperience;
    private List<String> knownSkills;

    // Misc
    private String resumeUrl; // optional link
    private String additionalNotes;

    private Instant appliedAt = Instant.now();
}


