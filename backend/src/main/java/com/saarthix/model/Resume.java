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
    private List<CustomSection> customSections;
    private List<String> sectionOrder;
    private Colors colors;
    private TypographySettings typography;
    private java.util.Map<String, String> sectionTitles; // Custom section titles
    private Boolean mentorReviewRequested = false;

    @Data
    public static class Colors {
        private String primary;
        private String secondary;
        private String accent;
        private String text;
    }

    @Data
    public static class TypographySettings {
        private String fontSize; // e.g., "12px", "14px"
        private String fontSpacing; // line-height, e.g., "1.5", "1.6"
        private String sectionSpacing; // margin-bottom for sections, e.g., "32px", "40px"
    }

    @Data
    public static class PersonalInfo {
        private String fullName;
        private String email;
        private String phone;
        private String location;
        private String title;
        private String profileImage; // URL or base64 encoded image
        private ProfileImageStyle profileImageStyle; // Style for image positioning and sizing
        
        @Data
        public static class ProfileImageStyle {
            private String width;
            private String height;
            private String left;
            private String top;
            private String position;
        }
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

    @Data
    public static class CustomSection {
        private String id;
        private String title;
        private String contentType; // "text" or "list"
        private String content;
        private List<String> items;
    }
}
