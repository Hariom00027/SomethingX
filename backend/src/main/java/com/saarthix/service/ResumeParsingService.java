package com.saarthix.service;

import com.saarthix.model.Resume;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class ResumeParsingService {

    public Resume parseResume(MultipartFile file, String templateId, String studentId) throws Exception {
        String content = extractText(file);
        return extractResumeData(content, templateId, studentId);
    }

    private String extractText(MultipartFile file) throws Exception {
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new IllegalArgumentException("File name is null");
        }

        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

        try (InputStream inputStream = file.getInputStream()) {
            if (extension.equals("pdf")) {
                return extractTextFromPdf(inputStream);
            } else if (extension.equals("docx") || extension.equals("doc")) {
                return extractTextFromDocx(inputStream);
            } else {
                throw new IllegalArgumentException("Unsupported file format: " + extension);
            }
        }
    }

    private String extractTextFromPdf(InputStream inputStream) throws Exception {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractTextFromDocx(InputStream inputStream) throws Exception {
        try (XWPFDocument document = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }

    private Resume extractResumeData(String content, String templateId, String studentId) {
        Resume resume = new Resume();
        resume.setStudentId(studentId);
        resume.setTemplateId(templateId);
        
        // Initialize default structure
        Resume.PersonalInfo personalInfo = new Resume.PersonalInfo();
        personalInfo.setProfileImageStyle(new Resume.PersonalInfo.ProfileImageStyle());
        resume.setPersonalInfo(personalInfo);
        resume.setEducation(new ArrayList<>());
        resume.setExperience(new ArrayList<>());
        resume.setProjects(new ArrayList<>());
        resume.setSkills(new ArrayList<>());
        resume.setAchievements(new ArrayList<>());
        resume.setCertificates(new ArrayList<>());
        resume.setLanguages(new ArrayList<>());
        resume.setHobbies(new ArrayList<>());
        resume.setLinks(new ArrayList<>());
        resume.setCustomSections(new ArrayList<Resume.CustomSection>());
        resume.setSectionOrder(Arrays.asList(
            "personalInfo", "summary", "bio", "experience", "education", 
            "projects", "skills", "achievements", "certificates", "languages", "hobbies"
        ));
        resume.setColors(new Resume.Colors());
        resume.getColors().setPrimary("#2563eb");
        resume.getColors().setSecondary("#64748b");
        resume.getColors().setAccent("#3b82f6");
        resume.setSectionTitles(new HashMap<>());

        // Normalize content
        String normalizedContent = content.replaceAll("\\r\\n", "\n").replaceAll("\\r", "\n");
        String[] lines = normalizedContent.split("\n");

        // Extract personal information
        extractPersonalInfo(resume, lines, normalizedContent);

        // Extract summary/bio
        extractSummaryAndBio(resume, lines, normalizedContent);

        // Extract experience
        extractExperience(resume, lines, normalizedContent);

        // Extract education
        extractEducation(resume, lines, normalizedContent);

        // Extract projects
        extractProjects(resume, lines, normalizedContent);

        // Extract skills
        extractSkills(resume, lines, normalizedContent);

        // Extract achievements
        extractAchievements(resume, lines, normalizedContent);

        // Extract certificates
        extractCertificates(resume, lines, normalizedContent);

        // Extract languages
        extractLanguages(resume, lines, normalizedContent);

        return resume;
    }

    private void extractPersonalInfo(Resume resume, String[] lines, String content) {
        Resume.PersonalInfo personalInfo = resume.getPersonalInfo();
        if (personalInfo == null) {
            personalInfo = new Resume.PersonalInfo();
            resume.setPersonalInfo(personalInfo);
        }

        // Extract email
        Pattern emailPattern = Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b");
        Matcher emailMatcher = emailPattern.matcher(content);
        if (emailMatcher.find()) {
            personalInfo.setEmail(emailMatcher.group());
        }

        // Extract phone
        Pattern phonePattern = Pattern.compile("(\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}");
        Matcher phoneMatcher = phonePattern.matcher(content);
        if (phoneMatcher.find()) {
            personalInfo.setPhone(phoneMatcher.group().trim());
        }

        // Extract name (usually first line or near top)
        if (lines.length > 0) {
            String firstLine = lines[0].trim();
            if (firstLine.length() > 0 && firstLine.length() < 50 && !firstLine.contains("@")) {
                personalInfo.setFullName(firstLine);
            }
        }

        // Extract location (look for common location patterns)
        Pattern locationPattern = Pattern.compile("([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*),?\\s+([A-Z]{2}|[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)");
        Matcher locationMatcher = locationPattern.matcher(content);
        if (locationMatcher.find()) {
            personalInfo.setLocation(locationMatcher.group().trim());
        }

        // Extract title (look for common job title keywords)
        String[] titleKeywords = {"Engineer", "Developer", "Manager", "Analyst", "Designer", "Consultant", "Specialist", "Director", "Lead", "Senior", "Junior"};
        for (String line : lines) {
            for (String keyword : titleKeywords) {
                if (line.contains(keyword) && line.length() < 60) {
                    personalInfo.setTitle(line.trim());
                    break;
                }
            }
            if (personalInfo.getTitle() != null) break;
        }
    }

    private void extractSummaryAndBio(Resume resume, String[] lines, String content) {
        // Look for summary section
        int summaryStart = findSectionStart(lines, Arrays.asList("SUMMARY", "PROFESSIONAL SUMMARY", "OBJECTIVE", "PROFILE"));
        if (summaryStart != -1) {
            StringBuilder summary = new StringBuilder();
            for (int i = summaryStart + 1; i < lines.length && i < summaryStart + 10; i++) {
                String line = lines[i].trim();
                if (line.isEmpty() || isSectionHeader(line)) break;
                if (summary.length() > 0) summary.append(" ");
                summary.append(line);
            }
            if (summary.length() > 0) {
                resume.setSummary(summary.toString().trim());
            }
        }
    }

    private void extractExperience(Resume resume, String[] lines, String content) {
        int expStart = findSectionStart(lines, Arrays.asList("EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT", "PROFESSIONAL EXPERIENCE", "CAREER"));
        if (expStart == -1) return;

        List<Resume.Experience> experiences = new ArrayList<>();
        int i = expStart + 1;
        
        while (i < lines.length) {
            String line = lines[i].trim();
            if (line.isEmpty() || isSectionHeader(line)) break;

            // Look for job title pattern
            if (line.length() > 0 && line.length() < 80 && !line.contains("@")) {
                Resume.Experience exp = new Resume.Experience();
                
                // Try to extract role and company
                String[] parts = line.split("\\s+-\\s+|\\s+at\\s+|\\s+@\\s+", 2);
                if (parts.length >= 1) {
                    exp.setRole(parts[0].trim());
                }
                if (parts.length >= 2) {
                    exp.setCompany(parts[1].trim());
                } else {
                    exp.setRole(line);
                }

                // Look for dates in next few lines
                i++;
                while (i < lines.length && i < expStart + 20) {
                    String nextLine = lines[i].trim();
                    if (nextLine.isEmpty() || isSectionHeader(nextLine)) break;
                    
                    // Extract dates
                    Pattern datePattern = Pattern.compile("(\\d{4}|\\w+\\s+\\d{4})\\s*-\\s*(\\d{4}|Present|Current|Now)");
                    Matcher dateMatcher = datePattern.matcher(nextLine);
                    if (dateMatcher.find()) {
                        exp.setStartDate(dateMatcher.group(1).trim());
                        exp.setEndDate(dateMatcher.group(2).trim());
                    }
                    
                    // Extract achievements/bullet points
                    if (nextLine.startsWith("•") || nextLine.startsWith("-") || nextLine.startsWith("*") || 
                        (nextLine.length() > 0 && Character.isUpperCase(nextLine.charAt(0)) && nextLine.length() < 200)) {
                        if (exp.getAchievements() == null) {
                            exp.setAchievements(new ArrayList<>());
                        }
                        String achievement = nextLine.replaceFirst("^[•\\-*]\\s*", "").trim();
                        if (!achievement.isEmpty()) {
                            exp.getAchievements().add(achievement);
                        }
                    }
                    i++;
                }

                if (exp.getRole() != null && !exp.getRole().isEmpty()) {
                    experiences.add(exp);
                }
            }
            i++;
        }

        resume.setExperience(experiences);
    }

    private void extractEducation(Resume resume, String[] lines, String content) {
        int eduStart = findSectionStart(lines, Arrays.asList("EDUCATION", "ACADEMIC", "QUALIFICATIONS"));
        if (eduStart == -1) return;

        List<Resume.Education> educations = new ArrayList<>();
        int i = eduStart + 1;
        
        while (i < lines.length) {
            String line = lines[i].trim();
            if (line.isEmpty() || isSectionHeader(line)) break;

            if (line.length() > 0 && (line.contains("Bachelor") || line.contains("Master") || 
                line.contains("Degree") || line.contains("University") || line.contains("College"))) {
                Resume.Education edu = new Resume.Education();
                
                // Extract degree
                if (line.contains("Bachelor") || line.contains("Master") || line.contains("PhD") || line.contains("Doctorate")) {
                    edu.setDegree(line);
                }

                // Look for institution and dates in next lines
                i++;
                while (i < lines.length && i < eduStart + 10) {
                    String nextLine = lines[i].trim();
                    if (nextLine.isEmpty() || isSectionHeader(nextLine)) break;
                    
                    if (nextLine.contains("University") || nextLine.contains("College") || nextLine.contains("Institute")) {
                        edu.setInstitution(nextLine);
                    }
                    
                    Pattern datePattern = Pattern.compile("(\\d{4})\\s*-\\s*(\\d{4}|Present)");
                    Matcher dateMatcher = datePattern.matcher(nextLine);
                    if (dateMatcher.find()) {
                        edu.setStartDate(dateMatcher.group(1));
                        edu.setEndDate(dateMatcher.group(2));
                    }
                    i++;
                }

                if (edu.getDegree() != null && !edu.getDegree().isEmpty()) {
                    educations.add(edu);
                }
            }
            i++;
        }

        resume.setEducation(educations);
    }

    private void extractProjects(Resume resume, String[] lines, String content) {
        int projStart = findSectionStart(lines, Arrays.asList("PROJECTS", "PROJECT EXPERIENCE"));
        if (projStart == -1) return;

        List<Resume.Project> projects = new ArrayList<>();
        int i = projStart + 1;
        
        while (i < lines.length) {
            String line = lines[i].trim();
            if (line.isEmpty() || isSectionHeader(line)) break;

            if (line.length() > 0 && line.length() < 100) {
                Resume.Project project = new Resume.Project();
                project.setName(line);
                project.setTechnologies(new ArrayList<>());
                
                // Look for description and technologies
                i++;
                StringBuilder description = new StringBuilder();
                while (i < lines.length && i < projStart + 15) {
                    String nextLine = lines[i].trim();
                    if (nextLine.isEmpty() || isSectionHeader(nextLine)) break;
                    
                    if (nextLine.startsWith("•") || nextLine.startsWith("-")) {
                        description.append(nextLine.replaceFirst("^[•\\-]\\s*", "")).append(" ");
                    } else if (nextLine.contains("http") || nextLine.contains("github") || nextLine.contains("www")) {
                        project.setLink(nextLine);
                    } else if (nextLine.length() < 50 && (nextLine.contains(",") || nextLine.split("\\s+").length < 5)) {
                        // Likely technologies
                        String[] techs = nextLine.split("[,;]");
                        for (String tech : techs) {
                            tech = tech.trim();
                            if (!tech.isEmpty()) {
                                project.getTechnologies().add(tech);
                            }
                        }
                    }
                    i++;
                }
                
                if (description.length() > 0) {
                    project.setDescription(description.toString().trim());
                }

                if (project.getName() != null && !project.getName().isEmpty()) {
                    projects.add(project);
                }
            }
            i++;
        }

        resume.setProjects(projects);
    }

    private void extractSkills(Resume resume, String[] lines, String content) {
        int skillsStart = findSectionStart(lines, Arrays.asList("SKILLS", "TECHNICAL SKILLS", "COMPETENCIES", "TECHNOLOGIES"));
        if (skillsStart == -1) return;

        List<String> skills = new ArrayList<>();
        int i = skillsStart + 1;
        
        while (i < lines.length && i < skillsStart + 20) {
            String line = lines[i].trim();
            if (line.isEmpty() || isSectionHeader(line)) break;
            
            // Split by common delimiters
            String[] skillArray = line.split("[,;|•\\-]");
            for (String skill : skillArray) {
                skill = skill.trim();
                if (skill.length() > 0 && skill.length() < 50) {
                    skills.add(skill);
                }
            }
            i++;
        }

        resume.setSkills(skills);
    }

    private void extractAchievements(Resume resume, String[] lines, String content) {
        int achStart = findSectionStart(lines, Arrays.asList("ACHIEVEMENTS", "AWARDS", "ACCOMPLISHMENTS", "HONORS"));
        if (achStart == -1) return;

        List<String> achievements = new ArrayList<>();
        int i = achStart + 1;
        
        while (i < lines.length && i < achStart + 15) {
            String line = lines[i].trim();
            if (line.isEmpty() || isSectionHeader(line)) break;
            
            String achievement = line.replaceFirst("^[•\\-*]\\s*", "").trim();
            if (achievement.length() > 0) {
                achievements.add(achievement);
            }
            i++;
        }

        resume.setAchievements(achievements);
    }

    private void extractCertificates(Resume resume, String[] lines, String content) {
        int certStart = findSectionStart(lines, Arrays.asList("CERTIFICATIONS", "CERTIFICATES", "LICENSES"));
        if (certStart == -1) return;

        List<Resume.Certificate> certificates = new ArrayList<>();
        int i = certStart + 1;
        
        while (i < lines.length && i < certStart + 15) {
            String line = lines[i].trim();
            if (line.isEmpty() || isSectionHeader(line)) break;
            
            Resume.Certificate cert = new Resume.Certificate();
            String[] parts = line.split("\\s+-\\s+|\\s+by\\s+|\\s+from\\s+", 2);
            if (parts.length >= 1) {
                cert.setName(parts[0].trim());
            }
            if (parts.length >= 2) {
                cert.setIssuer(parts[1].trim());
            } else {
                cert.setName(line);
            }
            
            // Look for date
            Pattern datePattern = Pattern.compile("(\\d{4}|\\w+\\s+\\d{4})");
            Matcher dateMatcher = datePattern.matcher(line);
            if (dateMatcher.find()) {
                cert.setIssueDate(dateMatcher.group());
            }

            if (cert.getName() != null && !cert.getName().isEmpty()) {
                certificates.add(cert);
            }
            i++;
        }

        resume.setCertificates(certificates);
    }

    private void extractLanguages(Resume resume, String[] lines, String content) {
        int langStart = findSectionStart(lines, Arrays.asList("LANGUAGES", "LANGUAGE"));
        if (langStart == -1) return;

        List<Resume.Language> languages = new ArrayList<>();
        int i = langStart + 1;
        
        while (i < lines.length && i < langStart + 10) {
            String line = lines[i].trim();
            if (line.isEmpty() || isSectionHeader(line)) break;
            
            String[] parts = line.split("[:\\-]");
            if (parts.length >= 1) {
                Resume.Language lang = new Resume.Language();
                lang.setName(parts[0].trim());
                if (parts.length >= 2) {
                    lang.setProficiency(parts[1].trim());
                } else {
                    lang.setProficiency("Intermediate");
                }
                languages.add(lang);
            }
            i++;
        }

        resume.setLanguages(languages);
    }

    private int findSectionStart(String[] lines, List<String> sectionNames) {
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].toUpperCase().trim();
            for (String sectionName : sectionNames) {
                if (line.contains(sectionName.toUpperCase()) || line.equals(sectionName.toUpperCase())) {
                    return i;
                }
            }
        }
        return -1;
    }

    private boolean isSectionHeader(String line) {
        String upperLine = line.toUpperCase().trim();
        String[] commonHeaders = {"EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS", "SUMMARY", 
            "OBJECTIVE", "CERTIFICATIONS", "LANGUAGES", "ACHIEVEMENTS", "CONTACT", "PERSONAL"};
        for (String header : commonHeaders) {
            if (upperLine.equals(header) || upperLine.startsWith(header + " ")) {
                return true;
            }
        }
        return false;
    }
}

