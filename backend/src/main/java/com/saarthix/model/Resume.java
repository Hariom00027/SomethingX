package com.saarthix.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "resumes")
public class Resume {

    @Id
    private String id;

    private String studentId;
    private String templateId;

    private PersonalInfo personalInfo;
    private String summary;
    private String bio;
    private List<Education> education;
    private List<Experience> experience;
    private List<Project> projects;
    private List<String> skills;
    private List<String> achievements;
    private List<Certificate> certificates;
    private List<String> hobbies;
    private List<Language> languages;
    private List<String> links;
    private List<String> sectionOrder;
    private Colors colors;
    private Boolean mentorReviewRequested = false;

    @Data
    public static class Colors {
        private String primary;
        private String secondary;
        private String accent;
    }

    @Data
    public static class PersonalInfo {
        private String fullName;
        private String email;
        private String phone;
        private String location;
        private String title;
    }

    @Data
    public static class Education {
        private String institution;
        private String degree;
        private String fieldOfStudy;
        private String startDate;
        private String endDate;
        private String details;
    }

    @Data
    public static class Experience {
        private String company;
        private String role;
        private String startDate;
        private String endDate;
        private List<String> achievements;
    }

    @Data
    public static class Project {
        private String name;
        private String description;
        private List<String> highlights;
        private String link;
        private List<String> technologies;
        private String startDate;
        private String endDate;
    }

    @Data
    public static class Certificate {
        private String name;
        private String issuer;
        private String issueDate;
        private String expiryDate;
        private String credentialId;
        private String credentialUrl;
    }

    @Data
    public static class Language {
        private String name;
        private String proficiency; // Beginner, Intermediate, Advanced, Native
    }
}
