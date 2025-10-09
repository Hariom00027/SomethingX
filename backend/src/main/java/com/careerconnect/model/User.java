package com.careerconnect.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    private String googleId;
    private String email;
    private String name;
    private String picture;
    private String firstName;
    private String lastName;
    
    private Set<String> roles;
    private String userType; // STUDENT, INSTITUTE, INDUSTRY
    
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private boolean active;
    
    // Additional profile fields
    private String phone;
    private String location;
    private String bio;
    private String linkedinUrl;
    private String githubUrl;
    
    // Institute specific fields
    private String instituteName;
    private String instituteType;
    private String instituteLocation;
    
    // Industry specific fields
    private String companyName;
    private String companyType;
    private String industry;
    private String position;
    
    // Student specific fields
    private String course; // e.g., B.Tech, B.Sc, M.Tech, etc.
    private String stream; // e.g., Computer Science, Electronics, etc.
    private String specialization; // e.g., AI/ML, Web Development, etc.
    private String year; // e.g., 1st Year, 2nd Year, etc.
    private String semester; // e.g., 1st Semester, 2nd Semester, etc.
    private String studentId; // Student ID/Roll Number
    private String batch; // e.g., 2023-2027, 2024-2028, etc.
    private String cgpa; // Current CGPA/GPA
    private String expectedGraduationYear; // Expected graduation year
    private String expectedGraduationMonth; // Expected graduation month (1-12)
    private String skills; // Technical skills (comma-separated)
    private String interests; // Areas of interest (comma-separated)
    private String achievements; // Academic achievements
    private String projects; // Projects worked on
    private String certifications; // Certifications obtained
    private String languages; // Programming languages known
    private String resumeUrl; // Link to resume/CV
    private String portfolioUrl; // Link to portfolio
}
