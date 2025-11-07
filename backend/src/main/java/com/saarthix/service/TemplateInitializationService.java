package com.saarthix.service;

import com.saarthix.model.ResumeTemplate;
import com.saarthix.repository.ResumeTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class TemplateInitializationService implements CommandLineRunner {

    @Autowired
    private ResumeTemplateRepository templateRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeTemplates();
    }

    private void initializeTemplates() {
        // Delete old templates that don't match our new template structure
        // We'll keep only templates that have css, layoutType, and hasProfileImage fields
        List<ResumeTemplate> allTemplates = templateRepository.findAll();
        for (ResumeTemplate template : allTemplates) {
            // Delete templates that don't have the new structure (css, layoutType)
            // These are the old templates that we want to replace
            if (template.getCss() == null || template.getLayoutType() == null) {
                templateRepository.delete(template);
                System.out.println("Deleted old template: " + template.getName());
            }
        }

        // Check which templates already exist by name
        boolean hasClassicProfessional = templateRepository.findAll().stream()
                .anyMatch(t -> "Classic Professional".equals(t.getName()));
        boolean hasModernSidebar = templateRepository.findAll().stream()
                .anyMatch(t -> "Modern Sidebar".equals(t.getName()));
        boolean hasExecutive = templateRepository.findAll().stream()
                .anyMatch(t -> "Executive".equals(t.getName()));
        boolean hasMinimalist = templateRepository.findAll().stream()
                .anyMatch(t -> "Minimalist".equals(t.getName()));
        boolean hasTraditional = templateRepository.findAll().stream()
                .anyMatch(t -> "Traditional".equals(t.getName()));
        boolean hasCreativePortfolio = templateRepository.findAll().stream()
                .anyMatch(t -> "Creative Portfolio".equals(t.getName()));
        boolean hasCorporateHeadshot = templateRepository.findAll().stream()
                .anyMatch(t -> "Corporate Headshot".equals(t.getName()));
        boolean hasModernProfessional = templateRepository.findAll().stream()
                .anyMatch(t -> "Modern Professional".equals(t.getName()));

        // Template 1: Classic Professional - Single column, ATS-friendly, no image
        if (!hasClassicProfessional) {
            ResumeTemplate classicProfessional = new ResumeTemplate();
            classicProfessional.setName("Classic Professional");
            classicProfessional.setDescription("Traditional single-column layout optimized for ATS systems. Clean and professional.");
            classicProfessional.setCategory("professional");
            classicProfessional.setPreviewUrl("/templates/classic-professional.svg");
            classicProfessional.setPrimaryColor("#1a1a1a");
            classicProfessional.setSecondaryColor("#4a4a4a");
            classicProfessional.setAccentColor("#2563eb");
            classicProfessional.setSections(Arrays.asList("personalInfo", "summary", "experience", "education", "skills", "certificates", "languages"));
            classicProfessional.setActive(true);
            classicProfessional.setHasProfileImage(false);
            classicProfessional.setLayoutType("single-column");
            classicProfessional.setCss(getClassicProfessionalCss());
            templateRepository.save(classicProfessional);
            System.out.println("Created template: Classic Professional");
        }

        // Template 2: Modern Sidebar - Two column with sidebar, with image
        if (!hasModernSidebar) {
            ResumeTemplate modernSidebar = new ResumeTemplate();
            modernSidebar.setName("Modern Sidebar");
            modernSidebar.setDescription("Two-column layout with sidebar for contact info and skills. Includes profile image section.");
            modernSidebar.setCategory("professional");
            modernSidebar.setPreviewUrl("/templates/modern-sidebar.svg");
            modernSidebar.setPrimaryColor("#1e40af");
            modernSidebar.setSecondaryColor("#64748b");
            modernSidebar.setAccentColor("#3b82f6");
            modernSidebar.setSections(Arrays.asList("personalInfo", "summary", "experience", "education", "skills", "projects", "certificates", "languages"));
            modernSidebar.setActive(true);
            modernSidebar.setHasProfileImage(true);
            modernSidebar.setLayoutType("sidebar");
            modernSidebar.setCss(getModernSidebarCss());
            templateRepository.save(modernSidebar);
            System.out.println("Created template: Modern Sidebar");
        }

        // Template 3: Executive - Clean single column with image at top
        if (!hasExecutive) {
            ResumeTemplate executive = new ResumeTemplate();
            executive.setName("Executive");
            executive.setDescription("Elegant single-column design with profile image at the top. Perfect for executive positions.");
            executive.setCategory("professional");
            executive.setPreviewUrl("/templates/executive.svg");
            executive.setPrimaryColor("#0f172a");
            executive.setSecondaryColor("#475569");
            executive.setAccentColor("#1e293b");
            executive.setSections(Arrays.asList("personalInfo", "summary", "experience", "education", "skills", "achievements", "certificates"));
            executive.setActive(true);
            executive.setHasProfileImage(true);
            executive.setLayoutType("modern");
            executive.setCss(getExecutiveCss());
            templateRepository.save(executive);
            System.out.println("Created template: Executive");
        }

        // Template 4: Minimalist - Simple two-column layout, with image
        if (!hasMinimalist) {
            ResumeTemplate minimalist = new ResumeTemplate();
            minimalist.setName("Minimalist");
            minimalist.setDescription("Clean two-column layout with minimal design. Features profile image and optimized spacing.");
            minimalist.setCategory("professional");
            minimalist.setPreviewUrl("/templates/minimalist.svg");
            minimalist.setPrimaryColor("#374151");
            minimalist.setSecondaryColor("#6b7280");
            minimalist.setAccentColor("#9ca3af");
            minimalist.setSections(Arrays.asList("personalInfo", "summary", "experience", "education", "skills", "projects", "languages", "hobbies"));
            minimalist.setActive(true);
            minimalist.setHasProfileImage(true);
            minimalist.setLayoutType("two-column");
            minimalist.setCss(getMinimalistCss());
            templateRepository.save(minimalist);
            System.out.println("Created template: Minimalist");
        }

        // Template 5: Traditional - Classic format, no image
        if (!hasTraditional) {
            ResumeTemplate traditional = new ResumeTemplate();
            traditional.setName("Traditional");
            traditional.setDescription("Classic resume format with clear section dividers. Highly ATS-compatible with no images.");
            traditional.setCategory("professional");
            traditional.setPreviewUrl("/templates/traditional.svg");
            traditional.setPrimaryColor("#000000");
            traditional.setSecondaryColor("#333333");
            traditional.setAccentColor("#666666");
            traditional.setSections(Arrays.asList("personalInfo", "summary", "experience", "education", "skills", "achievements", "certificates", "languages"));
            traditional.setActive(true);
            traditional.setHasProfileImage(false);
            traditional.setLayoutType("classic");
            traditional.setCss(getTraditionalCss());
            templateRepository.save(traditional);
            System.out.println("Created template: Traditional");
        }

        // Template 6: Creative Portfolio - Modern design with image
        if (!hasCreativePortfolio) {
            ResumeTemplate creativePortfolio = new ResumeTemplate();
            creativePortfolio.setName("Creative Portfolio");
            creativePortfolio.setDescription("Modern creative design with profile image. Perfect for designers and creative professionals.");
            creativePortfolio.setCategory("creative");
            creativePortfolio.setPreviewUrl("/templates/creative-portfolio.svg");
            creativePortfolio.setPrimaryColor("#7c3aed");
            creativePortfolio.setSecondaryColor("#a78bfa");
            creativePortfolio.setAccentColor("#c084fc");
            creativePortfolio.setSections(Arrays.asList("personalInfo", "summary", "experience", "education", "skills", "projects", "achievements", "certificates"));
            creativePortfolio.setActive(true);
            creativePortfolio.setHasProfileImage(true);
            creativePortfolio.setLayoutType("modern");
            creativePortfolio.setCss(getCreativePortfolioCss());
            templateRepository.save(creativePortfolio);
            System.out.println("Created template: Creative Portfolio");
        }

        // Template 7: Corporate Headshot - Professional with large image
        if (!hasCorporateHeadshot) {
            ResumeTemplate corporateHeadshot = new ResumeTemplate();
            corporateHeadshot.setName("Corporate Headshot");
            corporateHeadshot.setDescription("Professional corporate design with prominent profile image. Ideal for business executives.");
            corporateHeadshot.setCategory("professional");
            corporateHeadshot.setPreviewUrl("/templates/corporate-headshot.svg");
            corporateHeadshot.setPrimaryColor("#1e3a8a");
            corporateHeadshot.setSecondaryColor("#3b82f6");
            corporateHeadshot.setAccentColor("#60a5fa");
            corporateHeadshot.setSections(Arrays.asList("personalInfo", "summary", "experience", "education", "skills", "achievements", "certificates", "languages"));
            corporateHeadshot.setActive(true);
            corporateHeadshot.setHasProfileImage(true);
            corporateHeadshot.setLayoutType("sidebar");
            corporateHeadshot.setCss(getCorporateHeadshotCss());
            templateRepository.save(corporateHeadshot);
            System.out.println("Created template: Corporate Headshot");
        }

        // Template 8: Modern Professional - Clean design with image
        if (!hasModernProfessional) {
            ResumeTemplate modernProfessional = new ResumeTemplate();
            modernProfessional.setName("Modern Professional");
            modernProfessional.setDescription("Contemporary professional layout with profile image. Balanced design for all industries.");
            modernProfessional.setCategory("professional");
            modernProfessional.setPreviewUrl("/templates/modern-professional.svg");
            modernProfessional.setPrimaryColor("#059669");
            modernProfessional.setSecondaryColor("#10b981");
            modernProfessional.setAccentColor("#34d399");
            modernProfessional.setSections(Arrays.asList("personalInfo", "summary", "experience", "education", "skills", "projects", "certificates", "languages", "hobbies"));
            modernProfessional.setActive(true);
            modernProfessional.setHasProfileImage(true);
            modernProfessional.setLayoutType("two-column");
            modernProfessional.setCss(getModernProfessionalCss());
            templateRepository.save(modernProfessional);
            System.out.println("Created template: Modern Professional");
        }
        
        System.out.println("Template initialization completed. Total templates: " + templateRepository.count());
    }

    private String getClassicProfessionalCss() {
        return ".resume-container { font-family: 'Arial', 'Helvetica', sans-serif; line-height: 1.6; color: #1a1a1a; } " +
                ".header-section { text-align: center; padding: 20px 0; border-bottom: 3px solid #2563eb; margin-bottom: 25px; } " +
                ".name { font-size: 28px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; letter-spacing: 1px; } " +
                ".title { font-size: 16px; color: #4a4a4a; margin-bottom: 10px; font-weight: 500; } " +
                ".contact-info { font-size: 12px; color: #4a4a4a; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; } " +
                ".section { margin-bottom: 25px; } " +
                ".section-title { font-size: 18px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #2563eb; padding-bottom: 5px; margin-bottom: 15px; } " +
                ".section-content { font-size: 12px; line-height: 1.7; } " +
                ".experience-item, .education-item { margin-bottom: 20px; } " +
                ".item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; } " +
                ".item-title { font-weight: 600; font-size: 14px; color: #1a1a1a; } " +
                ".item-date { font-size: 11px; color: #4a4a4a; font-style: italic; } " +
                ".item-company { font-size: 12px; color: #4a4a4a; margin-bottom: 8px; } " +
                ".bullet-list { margin-left: 20px; margin-top: 5px; } " +
                ".bullet-list li { margin-bottom: 4px; font-size: 11px; } " +
                ".skills-container { display: flex; flex-wrap: wrap; gap: 8px; } " +
                ".skill-tag { background-color: #f0f4f8; color: #1a1a1a; padding: 4px 12px; border-radius: 4px; font-size: 11px; border: 1px solid #e2e8f0; } ";
    }

    private String getModernSidebarCss() {
        return ".resume-container { font-family: 'Arial', 'Helvetica', sans-serif; display: grid; grid-template-columns: 250px 1fr; gap: 30px; } " +
                ".sidebar { background-color: #1e40af; color: white; padding: 30px 20px; } " +
                ".profile-image-container { text-align: center; margin-bottom: 25px; } " +
                ".profile-image { width: 150px; height: 150px; border-radius: 50%; border: 4px solid white; object-fit: cover; margin: 0 auto; } " +
                ".sidebar-section { margin-bottom: 25px; } " +
                ".sidebar-title { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 8px; } " +
                ".sidebar-content { font-size: 11px; line-height: 1.6; } " +
                ".main-content { padding: 20px 0; } " +
                ".header-section { margin-bottom: 30px; } " +
                ".name { font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 5px; } " +
                ".title { font-size: 18px; color: #64748b; margin-bottom: 15px; } " +
                ".section { margin-bottom: 25px; } " +
                ".section-title { font-size: 18px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; border-left: 4px solid #3b82f6; padding-left: 12px; margin-bottom: 15px; } " +
                ".experience-item, .education-item { margin-bottom: 20px; padding-left: 16px; } " +
                ".item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; } " +
                ".item-title { font-weight: 600; font-size: 14px; color: #1e40af; } " +
                ".item-date { font-size: 11px; color: #64748b; } " +
                ".item-company { font-size: 12px; color: #64748b; margin-bottom: 8px; } " +
                ".bullet-list { margin-left: 20px; margin-top: 5px; } " +
                ".bullet-list li { margin-bottom: 4px; font-size: 11px; } " +
                ".contact-info-sidebar { font-size: 11px; line-height: 1.8; } " +
                ".contact-info-sidebar div { margin-bottom: 8px; } " +
                ".skills-sidebar { display: flex; flex-direction: column; gap: 6px; } " +
                ".skill-tag-sidebar { background-color: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 4px; font-size: 11px; } ";
    }

    private String getExecutiveCss() {
        return ".resume-container { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.7; color: #0f172a; } " +
                ".header-section { text-align: center; padding: 30px 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 30px; position: relative; } " +
                ".profile-image-container { margin-bottom: 20px; } " +
                ".profile-image { width: 120px; height: 120px; border-radius: 50%; border: 3px solid #1e293b; object-fit: cover; margin: 0 auto; display: block; } " +
                ".name { font-size: 36px; font-weight: 700; color: #0f172a; margin-bottom: 8px; letter-spacing: 2px; } " +
                ".title { font-size: 18px; color: #475569; margin-bottom: 15px; font-weight: 400; font-style: italic; } " +
                ".contact-info { font-size: 12px; color: #475569; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; } " +
                ".section { margin-bottom: 30px; } " +
                ".section-title { font-size: 20px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 18px; position: relative; padding-bottom: 8px; } " +
                ".section-title::after { content: ''; position: absolute; bottom: 0; left: 0; width: 60px; height: 2px; background-color: #1e293b; } " +
                ".section-content { font-size: 12px; line-height: 1.8; } " +
                ".experience-item, .education-item { margin-bottom: 25px; padding-left: 0; } " +
                ".item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; } " +
                ".item-title { font-weight: 600; font-size: 15px; color: #0f172a; } " +
                ".item-date { font-size: 11px; color: #475569; font-style: italic; } " +
                ".item-company { font-size: 13px; color: #475569; margin-bottom: 10px; } " +
                ".bullet-list { margin-left: 25px; margin-top: 8px; } " +
                ".bullet-list li { margin-bottom: 6px; font-size: 11px; line-height: 1.6; } " +
                ".skills-container { display: flex; flex-wrap: wrap; gap: 10px; } " +
                ".skill-tag { background-color: #f8fafc; color: #0f172a; padding: 6px 14px; border-radius: 2px; font-size: 11px; border: 1px solid #e2e8f0; } ";
    }

    private String getMinimalistCss() {
        return ".resume-container { font-family: 'Arial', 'Helvetica', sans-serif; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; line-height: 1.6; color: #374151; } " +
                ".left-column { } " +
                ".right-column { } " +
                ".header-section { grid-column: 1 / -1; text-align: center; padding: 25px 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 30px; } " +
                ".profile-image-container { margin-bottom: 20px; } " +
                ".profile-image { width: 140px; height: 140px; border-radius: 8px; object-fit: cover; margin: 0 auto; display: block; border: 2px solid #9ca3af; } " +
                ".name { font-size: 30px; font-weight: 600; color: #374151; margin-bottom: 5px; } " +
                ".title { font-size: 16px; color: #6b7280; margin-bottom: 12px; } " +
                ".contact-info { font-size: 11px; color: #6b7280; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; } " +
                ".section { margin-bottom: 25px; } " +
                ".section-title { font-size: 16px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb; } " +
                ".section-content { font-size: 11px; line-height: 1.7; } " +
                ".experience-item, .education-item { margin-bottom: 18px; } " +
                ".item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; } " +
                ".item-title { font-weight: 600; font-size: 13px; color: #374151; } " +
                ".item-date { font-size: 10px; color: #9ca3af; } " +
                ".item-company { font-size: 11px; color: #6b7280; margin-bottom: 6px; } " +
                ".bullet-list { margin-left: 18px; margin-top: 5px; } " +
                ".bullet-list li { margin-bottom: 3px; font-size: 10px; } " +
                ".skills-container { display: flex; flex-wrap: wrap; gap: 6px; } " +
                ".skill-tag { background-color: #f3f4f6; color: #374151; padding: 3px 10px; border-radius: 3px; font-size: 10px; } ";
    }

    private String getTraditionalCss() {
        return ".resume-container { font-family: 'Times New Roman', 'Georgia', serif; line-height: 1.5; color: #000000; } " +
                ".header-section { text-align: left; padding: 15px 0; border-bottom: 2px solid #000000; margin-bottom: 20px; } " +
                ".name { font-size: 24px; font-weight: 700; color: #000000; margin-bottom: 5px; text-transform: uppercase; } " +
                ".title { font-size: 14px; color: #333333; margin-bottom: 8px; } " +
                ".contact-info { font-size: 11px; color: #333333; line-height: 1.8; } " +
                ".section { margin-bottom: 20px; } " +
                ".section-title { font-size: 16px; font-weight: 700; color: #000000; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #666666; padding-bottom: 3px; } " +
                ".section-content { font-size: 11px; line-height: 1.6; } " +
                ".experience-item, .education-item { margin-bottom: 15px; } " +
                ".item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px; } " +
                ".item-title { font-weight: 600; font-size: 13px; color: #000000; } " +
                ".item-date { font-size: 10px; color: #333333; } " +
                ".item-company { font-size: 11px; color: #333333; margin-bottom: 5px; } " +
                ".bullet-list { margin-left: 20px; margin-top: 3px; } " +
                ".bullet-list li { margin-bottom: 2px; font-size: 10px; } " +
                ".skills-container { display: flex; flex-wrap: wrap; gap: 5px; } " +
                ".skill-tag { background-color: #f5f5f5; color: #000000; padding: 2px 8px; border: 1px solid #cccccc; font-size: 10px; } ";
    }

    private String getCreativePortfolioCss() {
        return ".resume-container { font-family: 'Arial', 'Helvetica', sans-serif; line-height: 1.6; color: #1a1a1a; background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); } " +
                ".header-section { text-align: center; padding: 40px 0; background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; margin: -40px -40px 40px -40px; border-radius: 0 0 20px 20px; } " +
                ".profile-image-container { margin-bottom: 20px; } " +
                ".profile-image { width: 160px; height: 160px; border-radius: 50%; border: 5px solid white; object-fit: cover; margin: 0 auto; display: block; box-shadow: 0 8px 16px rgba(0,0,0,0.2); } " +
                ".name { font-size: 34px; font-weight: 700; color: white; margin-bottom: 8px; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); } " +
                ".title { font-size: 18px; color: rgba(255,255,255,0.9); margin-bottom: 15px; font-weight: 400; } " +
                ".contact-info { font-size: 12px; color: rgba(255,255,255,0.85); display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; } " +
                ".section { margin-bottom: 30px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(124,58,237,0.1); } " +
                ".section-title { font-size: 20px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; border-left: 5px solid #c084fc; padding-left: 15px; margin-bottom: 18px; } " +
                ".section-content { font-size: 12px; line-height: 1.8; color: #374151; } " +
                ".experience-item, .education-item { margin-bottom: 22px; padding-bottom: 18px; border-bottom: 1px solid #e5e7eb; } " +
                ".experience-item:last-child, .education-item:last-child { border-bottom: none; } " +
                ".item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; } " +
                ".item-title { font-weight: 600; font-size: 15px; color: #7c3aed; } " +
                ".item-date { font-size: 11px; color: #a78bfa; font-weight: 500; } " +
                ".item-company { font-size: 13px; color: #6b7280; margin-bottom: 10px; } " +
                ".bullet-list { margin-left: 22px; margin-top: 8px; } " +
                ".bullet-list li { margin-bottom: 5px; font-size: 11px; line-height: 1.7; } " +
                ".skills-container { display: flex; flex-wrap: wrap; gap: 10px; } " +
                ".skill-tag { background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 500; box-shadow: 0 2px 4px rgba(124,58,237,0.2); } ";
    }

    private String getCorporateHeadshotCss() {
        return ".resume-container { font-family: 'Arial', 'Helvetica', sans-serif; display: grid; grid-template-columns: 280px 1fr; gap: 0; } " +
                ".sidebar { background: linear-gradient(180deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 40px 25px; min-height: 100%; } " +
                ".profile-image-container { text-align: center; margin-bottom: 30px; } " +
                ".profile-image { width: 200px; height: 200px; border-radius: 50%; border: 6px solid white; object-fit: cover; margin: 0 auto; display: block; box-shadow: 0 8px 24px rgba(0,0,0,0.3); } " +
                ".header-section { margin-bottom: 30px; } " +
                ".name { font-size: 28px; font-weight: 700; color: white; margin-bottom: 8px; text-align: center; letter-spacing: 1px; } " +
                ".title { font-size: 16px; color: rgba(255,255,255,0.9); margin-bottom: 20px; text-align: center; font-weight: 400; } " +
                ".contact-info-sidebar { font-size: 12px; line-height: 2; text-align: center; } " +
                ".contact-info-sidebar div { margin-bottom: 12px; } " +
                ".sidebar-section { margin-bottom: 30px; } " +
                ".sidebar-title { font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 15px; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 10px; } " +
                ".sidebar-content { font-size: 12px; line-height: 1.8; } " +
                ".main-content { padding: 40px 30px; background: white; } " +
                ".section { margin-bottom: 30px; } " +
                ".section-title { font-size: 20px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px; border-bottom: 3px solid #3b82f6; padding-bottom: 8px; margin-bottom: 20px; } " +
                ".section-content { font-size: 12px; line-height: 1.7; color: #374151; } " +
                ".experience-item, .education-item { margin-bottom: 22px; padding-left: 20px; border-left: 3px solid #60a5fa; } " +
                ".item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; } " +
                ".item-title { font-weight: 600; font-size: 15px; color: #1e3a8a; } " +
                ".item-date { font-size: 11px; color: #3b82f6; font-weight: 500; } " +
                ".item-company { font-size: 13px; color: #64748b; margin-bottom: 10px; } " +
                ".bullet-list { margin-left: 20px; margin-top: 8px; } " +
                ".bullet-list li { margin-bottom: 5px; font-size: 11px; line-height: 1.6; } " +
                ".skills-sidebar { display: flex; flex-direction: column; gap: 8px; } " +
                ".skill-tag-sidebar { background-color: rgba(255,255,255,0.25); padding: 6px 12px; border-radius: 6px; font-size: 12px; border: 1px solid rgba(255,255,255,0.3); } " +
                ".skills-container { display: flex; flex-wrap: wrap; gap: 8px; } " +
                ".skill-tag { background-color: #eff6ff; color: #1e3a8a; padding: 5px 12px; border-radius: 6px; font-size: 11px; border: 1px solid #3b82f6; font-weight: 500; } ";
    }

    private String getModernProfessionalCss() {
        return ".resume-container { font-family: 'Arial', 'Helvetica', sans-serif; display: grid; grid-template-columns: 1fr 1fr; gap: 35px; line-height: 1.65; color: #374151; } " +
                ".left-column { } " +
                ".right-column { } " +
                ".header-section { grid-column: 1 / -1; text-align: center; padding: 35px 0; background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%); color: white; margin: -40px -40px 40px -40px; border-radius: 0 0 15px 15px; } " +
                ".profile-image-container { margin-bottom: 25px; } " +
                ".profile-image { width: 150px; height: 150px; border-radius: 50%; border: 5px solid white; object-fit: cover; margin: 0 auto; display: block; box-shadow: 0 6px 20px rgba(0,0,0,0.15); } " +
                ".name { font-size: 32px; font-weight: 700; color: white; margin-bottom: 6px; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); } " +
                ".title { font-size: 17px; color: rgba(255,255,255,0.95); margin-bottom: 15px; font-weight: 400; } " +
                ".contact-info { font-size: 12px; color: rgba(255,255,255,0.9); display: flex; justify-content: center; gap: 18px; flex-wrap: wrap; } " +
                ".section { margin-bottom: 28px; } " +
                ".section-title { font-size: 17px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 15px; padding-bottom: 6px; border-bottom: 2px solid #10b981; } " +
                ".section-content { font-size: 11px; line-height: 1.75; color: #4b5563; } " +
                ".experience-item, .education-item { margin-bottom: 20px; padding: 12px; background: #f0fdf4; border-left: 4px solid #34d399; border-radius: 4px; } " +
                ".item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; } " +
                ".item-title { font-weight: 600; font-size: 14px; color: #059669; } " +
                ".item-date { font-size: 10px; color: #10b981; font-weight: 500; } " +
                ".item-company { font-size: 12px; color: #6b7280; margin-bottom: 8px; } " +
                ".bullet-list { margin-left: 20px; margin-top: 6px; } " +
                ".bullet-list li { margin-bottom: 4px; font-size: 10px; line-height: 1.6; } " +
                ".skills-container { display: flex; flex-wrap: wrap; gap: 7px; } " +
                ".skill-tag { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: white; padding: 5px 12px; border-radius: 15px; font-size: 10px; font-weight: 500; box-shadow: 0 2px 4px rgba(5,150,105,0.2); } ";
    }
}
