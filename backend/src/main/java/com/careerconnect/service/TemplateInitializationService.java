package com.careerconnect.service;

import com.careerconnect.model.ResumeTemplate;
import com.careerconnect.repository.ResumeTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class TemplateInitializationService implements CommandLineRunner {

    @Autowired
    private ResumeTemplateRepository templateRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeTemplates();
    }

    private void initializeTemplates() {
        // Check if templates already exist
        if (templateRepository.count() > 0) {
            return;
        }

        // Modern Blue Template
        ResumeTemplate modernBlue = new ResumeTemplate();
        modernBlue.setName("Modern Blue");
        modernBlue.setDescription("Clean, professional template with blue accents");
        modernBlue.setCategory("professional");
        modernBlue.setPreviewUrl("/templates/modern-blue.svg");
        modernBlue.setPrimaryColor("#2563eb");
        modernBlue.setSecondaryColor("#64748b");
        modernBlue.setAccentColor("#3b82f6");
        modernBlue.setSections(Arrays.asList("personalInfo", "summary", "bio", "experience", "education", "skills", "achievements", "certificates", "languages", "hobbies"));
        modernBlue.setActive(true);
        modernBlue.setCss(getModernBlueCss());
        templateRepository.save(modernBlue);

        // Classic Green Template
        ResumeTemplate classicGreen = new ResumeTemplate();
        classicGreen.setName("Classic Green");
        classicGreen.setDescription("Traditional template with green highlights");
        classicGreen.setCategory("professional");
        classicGreen.setPreviewUrl("/templates/classic-green.svg");
        classicGreen.setPrimaryColor("#059669");
        classicGreen.setSecondaryColor("#6b7280");
        classicGreen.setAccentColor("#10b981");
        classicGreen.setSections(Arrays.asList("personalInfo", "summary", "bio", "experience", "education", "skills", "achievements", "certificates", "languages", "hobbies"));
        classicGreen.setActive(true);
        classicGreen.setCss(getClassicGreenCss());
        templateRepository.save(classicGreen);

        // Creative Purple Template
        ResumeTemplate creativePurple = new ResumeTemplate();
        creativePurple.setName("Creative Purple");
        creativePurple.setDescription("Modern creative template with purple accents");
        creativePurple.setCategory("creative");
        creativePurple.setPreviewUrl("/templates/creative-purple.svg");
        creativePurple.setPrimaryColor("#7c3aed");
        creativePurple.setSecondaryColor("#6b7280");
        creativePurple.setAccentColor("#8b5cf6");
        creativePurple.setSections(Arrays.asList("personalInfo", "summary", "bio", "experience", "education", "skills", "achievements", "certificates", "languages", "hobbies"));
        creativePurple.setActive(true);
        creativePurple.setCss(getCreativePurpleCss());
        templateRepository.save(creativePurple);

        // Professional Red Template
        ResumeTemplate professionalRed = new ResumeTemplate();
        professionalRed.setName("Professional Red");
        professionalRed.setDescription("Bold professional template with red accents");
        professionalRed.setCategory("professional");
        professionalRed.setPreviewUrl("/templates/professional-red.svg");
        professionalRed.setPrimaryColor("#dc2626");
        professionalRed.setSecondaryColor("#6b7280");
        professionalRed.setAccentColor("#ef4444");
        professionalRed.setSections(Arrays.asList("personalInfo", "summary", "bio", "experience", "education", "skills", "achievements", "certificates", "languages", "hobbies"));
        professionalRed.setActive(true);
        professionalRed.setCss(getProfessionalRedCss());
        templateRepository.save(professionalRed);
    }

    private String getModernBlueCss() {
        return ".header {" +
                "background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);" +
                "color: white;" +
                "padding: 20px;" +
                "margin: -20px -20px 20px -20px;" +
                "border-radius: 0 0 10px 10px;" +
                "}" +
                ".name {" +
                "color: white;" +
                "text-shadow: 0 2px 4px rgba(0,0,0,0.3);" +
                "}" +
                ".title {" +
                "color: #e0e7ff;" +
                "}" +
                ".contact-info {" +
                "color: #e0e7ff;" +
                "}" +
                ".section-title {" +
                "border-left: 4px solid #2563eb;" +
                "padding-left: 10px;" +
                "background-color: #f8fafc;" +
                "padding: 8px 10px;" +
                "margin: 0 -10px 8px -10px;" +
                "}";
    }

    private String getClassicGreenCss() {
        return ".header {" +
                "border-bottom: 4px solid #059669;" +
                "background-color: #f0fdf4;" +
                "padding: 20px;" +
                "margin: -20px -20px 20px -20px;" +
                "}" +
                ".section-title {" +
                "border-bottom: 2px solid #059669;" +
                "color: #059669;" +
                "padding-bottom: 5px;" +
                "}" +
                ".skill-tag, .tech-tag, .hobby-tag {" +
                "background-color: #059669;" +
                "color: white;" +
                "border-radius: 15px;" +
                "padding: 4px 12px;" +
                "font-size: 9px;" +
                "margin: 2px;" +
                "}";
    }

    private String getCreativePurpleCss() {
        return ".header {" +
                "background: linear-gradient(45deg, #7c3aed, #8b5cf6);" +
                "color: white;" +
                "padding: 25px;" +
                "margin: -20px -20px 20px -20px;" +
                "border-radius: 15px;" +
                "box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);" +
                "}" +
                ".name {" +
                "color: white;" +
                "font-size: 28px;" +
                "text-shadow: 0 2px 4px rgba(0,0,0,0.3);" +
                "}" +
                ".section-title {" +
                "background: linear-gradient(90deg, #7c3aed, #8b5cf6);" +
                "color: white;" +
                "padding: 10px 15px;" +
                "margin: 0 -15px 10px -15px;" +
                "border-radius: 8px;" +
                "font-size: 13px;" +
                "text-transform: uppercase;" +
                "letter-spacing: 1px;" +
                "}" +
                ".skill-tag, .tech-tag, .hobby-tag {" +
                "background: linear-gradient(45deg, #7c3aed, #8b5cf6);" +
                "color: white;" +
                "border-radius: 20px;" +
                "padding: 4px 12px;" +
                "font-size: 9px;" +
                "margin: 2px;" +
                "box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);" +
                "}";
    }

    private String getProfessionalRedCss() {
        return ".header {" +
                "background-color: #dc2626;" +
                "color: white;" +
                "padding: 20px;" +
                "margin: -20px -20px 20px -20px;" +
                "position: relative;" +
                "}" +
                ".header::after {" +
                "content: '';" +
                "position: absolute;" +
                "bottom: -10px;" +
                "left: 0;" +
                "right: 0;" +
                "height: 10px;" +
                "background: linear-gradient(90deg, #dc2626, #ef4444);" +
                "}" +
                ".name {" +
                "color: white;" +
                "font-weight: 700;" +
                "}" +
                ".title {" +
                "color: #fecaca;" +
                "}" +
                ".contact-info {" +
                "color: #fecaca;" +
                "}" +
                ".section-title {" +
                "color: #dc2626;" +
                "border-left: 5px solid #dc2626;" +
                "padding-left: 12px;" +
                "background-color: #fef2f2;" +
                "padding: 10px 12px;" +
                "margin: 0 -12px 10px -12px;" +
                "font-weight: 600;" +
                "}" +
                ".skill-tag, .tech-tag, .hobby-tag {" +
                "background-color: #dc2626;" +
                "color: white;" +
                "border-radius: 4px;" +
                "padding: 3px 10px;" +
                "font-size: 9px;" +
                "margin: 2px;" +
                "font-weight: 500;" +
                "}";
    }
}