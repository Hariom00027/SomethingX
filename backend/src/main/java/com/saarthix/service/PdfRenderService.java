package com.saarthix.service;

import com.saarthix.model.Resume;
import com.saarthix.model.ResumeTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.ArrayList;
import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;

@Service
public class PdfRenderService {

    // A4 dimensions in pixels at 96 DPI
    private static final double A4_WIDTH = 793.7;  // 210mm
    private static final double A4_HEIGHT = 1122.5; // 297mm
    private static final int A4_PADDING = 40;

    public byte[] render(Resume resume, ResumeTemplate template) {
        if (resume == null) {
            System.err.println("Resume is null!");
            return generateBasicPdfStructure();
        }
        
        if (template == null) {
            System.err.println("Template is null, creating default template");
            template = createDefaultTemplate();
        }
        
        try {
            // Try to use iText if available
            return generatePdfWithIText(resume, template);
        } catch (Exception e) {
            System.err.println("iText PDF generation failed: " + e.getMessage());
            e.printStackTrace();
            // Fallback to simple PDF generation
            return generateSimplePdf(resume);
        }
    }
    
    private ResumeTemplate createDefaultTemplate() {
        ResumeTemplate template = new ResumeTemplate();
        template.setLayoutType("single-column");
        template.setPrimaryColor("#2563eb");
        template.setSecondaryColor("#64748b");
        template.setAccentColor("#3b82f6");
        template.setHasProfileImage(false);
        template.setCss("");
        return template;
    }

    private byte[] generatePdfWithIText(Resume resume, ResumeTemplate template) {
        try {
            // Generate HTML content that matches frontend exactly
            String htmlContent = generateHtmlContent(resume, template);
            System.out.println("Generated HTML content length: " + htmlContent.length());
            
            if (htmlContent == null || htmlContent.trim().isEmpty()) {
                System.err.println("Generated HTML content is empty!");
                return generateMinimalPdfWithContent(resume);
            }
            
            // Use iText HTML to PDF converter directly
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            
            // Configure converter properties with A4 page size and zero margins
            ConverterProperties converterProperties = new ConverterProperties();
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            pdfDocument.setDefaultPageSize(PageSize.A4);
            
            // Convert HTML to PDF with configured properties
            HtmlConverter.convertToPdf(htmlContent, pdfDocument, converterProperties);
            
            pdfDocument.close();
            
            byte[] result = outputStream.toByteArray();
            System.out.println("Generated PDF size: " + result.length + " bytes");
            
            if (result.length < 1000) {
                System.err.println("PDF size is suspiciously small, might be empty. Falling back to minimal PDF.");
                return generateMinimalPdfWithContent(resume);
            }
            
            return result;
        } catch (Exception e) {
            System.err.println("iText PDF generation error: " + e.getMessage());
            e.printStackTrace();
            // Don't throw, return fallback instead
            return generateMinimalPdfWithContent(resume);
        }
    }

    private byte[] generateSimplePdf(Resume resume) {
        // Fallback to minimal PDF with content
        return generateMinimalPdfWithContent(resume);
    }
    
    private byte[] generateMinimalPdfWithContent(Resume resume) {
        // Generate a simple PDF with actual content using iText
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            
            // Add content
            if (resume.getPersonalInfo() != null) {
                String fullName = resume.getPersonalInfo().getFullName();
                if (fullName != null && !fullName.trim().isEmpty()) {
                    document.add(new Paragraph(fullName).setFontSize(20).setBold());
                } else {
                    document.add(new Paragraph("Resume").setFontSize(20).setBold());
                }
                
                if (resume.getPersonalInfo().getTitle() != null && !resume.getPersonalInfo().getTitle().trim().isEmpty()) {
                    document.add(new Paragraph(resume.getPersonalInfo().getTitle()).setFontSize(14));
                }
                
                // Contact info
                StringBuilder contact = new StringBuilder();
                if (resume.getPersonalInfo().getEmail() != null && !resume.getPersonalInfo().getEmail().trim().isEmpty()) {
                    contact.append(resume.getPersonalInfo().getEmail());
                }
                if (resume.getPersonalInfo().getPhone() != null && !resume.getPersonalInfo().getPhone().trim().isEmpty()) {
                    if (contact.length() > 0) contact.append(" | ");
                    contact.append(resume.getPersonalInfo().getPhone());
                }
                if (resume.getPersonalInfo().getLocation() != null && !resume.getPersonalInfo().getLocation().trim().isEmpty()) {
                    if (contact.length() > 0) contact.append(" | ");
                    contact.append(resume.getPersonalInfo().getLocation());
                }
                if (contact.length() > 0) {
                    document.add(new Paragraph(contact.toString()).setFontSize(10));
                }
            }
            
            if (resume.getSummary() != null && !resume.getSummary().trim().isEmpty()) {
                document.add(new Paragraph("PROFESSIONAL SUMMARY").setBold().setMarginTop(10));
                document.add(new Paragraph(resume.getSummary()));
            }
            
            if (resume.getExperience() != null && !resume.getExperience().isEmpty()) {
                document.add(new Paragraph("EXPERIENCE").setBold().setMarginTop(10));
                for (Resume.Experience exp : resume.getExperience()) {
                    if (exp != null && exp.getRole() != null && exp.getCompany() != null) {
                        document.add(new Paragraph(exp.getRole() + " - " + exp.getCompany()).setBold());
                        if (exp.getStartDate() != null || exp.getEndDate() != null) {
                            document.add(new Paragraph((exp.getStartDate() != null ? exp.getStartDate() : "") + 
                                " - " + (exp.getEndDate() != null ? exp.getEndDate() : "")).setFontSize(10));
                        }
                        if (exp.getAchievements() != null) {
                            for (String achievement : exp.getAchievements()) {
                                if (achievement != null && !achievement.trim().isEmpty()) {
                                    document.add(new Paragraph("• " + achievement).setMarginLeft(20));
                                }
                            }
                        }
                    }
                }
            }
            
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            System.err.println("Even minimal PDF generation failed: " + e.getMessage());
            e.printStackTrace();
            // Return a basic valid PDF structure as last resort
            return generateBasicPdfStructure();
        }
    }
    
    private byte[] generateBasicPdfStructure() {
        // Generate a minimal valid PDF with "Resume" text
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            document.add(new Paragraph("Resume").setFontSize(20).setBold());
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            System.err.println("Basic PDF structure generation failed: " + e.getMessage());
            return new byte[0];
        }
    }

    public String generateHtmlContent(Resume resume, ResumeTemplate template) {
        StringBuilder html = new StringBuilder();
        
        // Get colors from resume or use template defaults
        String primaryColor = resume.getColors() != null && resume.getColors().getPrimary() != null 
            ? resume.getColors().getPrimary() 
            : (template.getPrimaryColor() != null ? template.getPrimaryColor() : "#2563eb");
        String secondaryColor = resume.getColors() != null && resume.getColors().getSecondary() != null 
            ? resume.getColors().getSecondary() 
            : (template.getSecondaryColor() != null ? template.getSecondaryColor() : "#64748b");
        String accentColor = resume.getColors() != null && resume.getColors().getAccent() != null 
            ? resume.getColors().getAccent() 
            : (template.getAccentColor() != null ? template.getAccentColor() : "#3b82f6");
        
        String layoutType = template.getLayoutType() != null ? template.getLayoutType() : "single-column";
        boolean hasProfileImage = template.isHasProfileImage() 
            && resume.getPersonalInfo() != null 
            && resume.getPersonalInfo().getProfileImage() != null 
            && !resume.getPersonalInfo().getProfileImage().trim().isEmpty();
        
        // Start HTML document with CSS
        html.append("<!DOCTYPE html><html><head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<style>");
        html.append(getCompleteCss(primaryColor, secondaryColor, accentColor, layoutType));
        if (template.getCss() != null && !template.getCss().trim().isEmpty()) {
            html.append(template.getCss());
        }
        html.append("</style></head><body>");

        // Get visible sections in order
        List<String> sectionOrder = resume.getSectionOrder();
        if (sectionOrder == null || sectionOrder.isEmpty()) {
            sectionOrder = List.of(
                "personalInfo", "summary", "bio", "experience", "education", 
                "projects", "skills", "achievements", "certificates", "languages", "hobbies"
            );
        }

        // Filter to only visible sections
        List<String> visibleSections = new ArrayList<>();
        for (String sectionId : sectionOrder) {
            if (hasSectionContent(resume, sectionId)) {
                visibleSections.add(sectionId);
            }
        }
        
        // Ensure we have at least personalInfo section
        if (visibleSections.isEmpty() && resume.getPersonalInfo() != null) {
            visibleSections.add("personalInfo");
        }

        // Split into pages (simplified - one page for now, can be enhanced)
        List<List<String>> pages = splitIntoPages(visibleSections);
        
        // Ensure we have at least one page
        if (pages.isEmpty()) {
            pages.add(new ArrayList<>());
            if (resume.getPersonalInfo() != null) {
                pages.get(0).add("personalInfo");
            }
        }
        
        // Generate pages
        for (int pageIndex = 0; pageIndex < pages.size(); pageIndex++) {
            List<String> pageSections = pages.get(pageIndex);
            html.append(generateA4Page(resume, template, pageSections, pageIndex + 1, pages.size(), 
                layoutType, primaryColor, secondaryColor, accentColor, hasProfileImage));
        }

        html.append("</body></html>");
        return html.toString();
    }

    private String generateA4Page(Resume resume, ResumeTemplate template, List<String> pageSections, 
            int pageNumber, int totalPages, String layoutType, String primaryColor, 
            String secondaryColor, String accentColor, boolean hasProfileImage) {
        StringBuilder html = new StringBuilder();
        
        // A4 page wrapper - no margins or borders for clean print
        html.append("<div class='a4-page' style='");
        html.append("width: ").append(A4_WIDTH).append("px; ");
        html.append("min-height: ").append(A4_HEIGHT).append("px; ");
        html.append("padding: ").append(A4_PADDING).append("px; ");
        html.append("box-sizing: border-box; ");
        html.append("background: white; ");
        html.append("margin: 0; ");
        html.append("page-break-after: always; ");
        html.append("page-break-inside: avoid; ");
        html.append("border: none; ");
        html.append("box-shadow: none;");
        html.append("'>");
        
        // Resume container with layout type
        html.append("<div class='resume-container ").append(layoutType).append("'>");
        
        boolean isSidebarLayout = "sidebar".equals(layoutType);
        boolean isTwoColumn = "two-column".equals(layoutType);
        
        // Sidebar sections for sidebar layout
        List<String> sidebarSections = List.of("personalInfo", "skills", "languages", "certificates");
        List<String> sidebarContent = new ArrayList<>();
        List<String> mainContent = new ArrayList<>();
        
        if (isSidebarLayout) {
            for (String sectionId : pageSections) {
                if (sidebarSections.contains(sectionId)) {
                    sidebarContent.add(sectionId);
                } else {
                    mainContent.add(sectionId);
                }
            }
            
            // Render sidebar
            if (!sidebarContent.isEmpty()) {
                html.append("<div class='sidebar'>");
                for (String sectionId : sidebarContent) {
                    html.append(generateSectionHtml(resume, sectionId, template, hasProfileImage));
                }
                html.append("</div>");
            }
            
            // Render main content
            if (!mainContent.isEmpty()) {
                html.append("<div class='main-content'>");
                for (String sectionId : mainContent) {
                    html.append(generateSectionHtml(resume, sectionId, template, hasProfileImage));
                }
                html.append("</div>");
            }
        } else if (isTwoColumn) {
            // Two column layout
            html.append("<div class='left-column'>");
            for (int i = 0; i < pageSections.size(); i += 2) {
                html.append(generateSectionHtml(resume, pageSections.get(i), template, hasProfileImage));
            }
            html.append("</div>");
            html.append("<div class='right-column'>");
            for (int i = 1; i < pageSections.size(); i += 2) {
                html.append(generateSectionHtml(resume, pageSections.get(i), template, hasProfileImage));
            }
            html.append("</div>");
        } else {
            // Single column layout
            for (String sectionId : pageSections) {
                html.append(generateSectionHtml(resume, sectionId, template, hasProfileImage));
            }
        }
        
        html.append("</div>"); // resume-container
        
        // Page number
        if (totalPages > 1) {
            html.append("<div class='page-number'>Page ").append(pageNumber).append(" of ").append(totalPages).append("</div>");
        }
        
        html.append("</div>"); // a4-page
        return html.toString();
    }

    private String generateSectionHtml(Resume resume, String sectionId, ResumeTemplate template, boolean hasProfileImage) {
        switch (sectionId) {
            case "personalInfo":
                return generatePersonalInfoSection(resume, template, hasProfileImage);
            case "summary":
                return generateSummarySection(resume);
            case "bio":
                return generateBioSection(resume);
            case "experience":
                return generateExperienceSection(resume);
            case "education":
                return generateEducationSection(resume);
            case "projects":
                return generateProjectsSection(resume);
            case "skills":
                return generateSkillsSection(resume);
            case "achievements":
                return generateAchievementsSection(resume);
            case "certificates":
                return generateCertificatesSection(resume);
            case "languages":
                return generateLanguagesSection(resume);
            case "hobbies":
                return generateHobbiesSection(resume);
            default:
                return "";
        }
    }

    private String generatePersonalInfoSection(Resume resume, ResumeTemplate template, boolean hasProfileImage) {
        if (resume.getPersonalInfo() == null) return "";
        
        StringBuilder html = new StringBuilder();
        String layoutType = template.getLayoutType() != null ? template.getLayoutType() : "single-column";
        String headerClass = "sidebar".equals(layoutType) ? "header-section sidebar-header" : "header-section";
        
        html.append("<div class='").append(headerClass).append("' style='position: relative;'>");
        
        // Profile image if available
        if (hasProfileImage && resume.getPersonalInfo().getProfileImage() != null) {
            String imageSrc = resume.getPersonalInfo().getProfileImage();
            // If it's a base64 image, use it directly; otherwise, iText might have issues with external URLs
            Resume.PersonalInfo.ProfileImageStyle imgStyle = resume.getPersonalInfo().getProfileImageStyle();
            String imgStyleStr = "";
            if (imgStyle != null) {
                if (imgStyle.getWidth() != null) imgStyleStr += "width: " + imgStyle.getWidth() + "; ";
                if (imgStyle.getHeight() != null) imgStyleStr += "height: " + imgStyle.getHeight() + "; ";
                if (imgStyle.getLeft() != null) imgStyleStr += "left: " + imgStyle.getLeft() + "; ";
                if (imgStyle.getTop() != null) imgStyleStr += "top: " + imgStyle.getTop() + "; ";
                if (imgStyle.getPosition() != null) imgStyleStr += "position: " + imgStyle.getPosition() + "; ";
            }
            // Ensure default size if not specified
            if (!imgStyleStr.contains("width:")) imgStyleStr += "width: 150px; ";
            if (!imgStyleStr.contains("height:")) imgStyleStr += "height: 150px; ";
            
            html.append("<img src='").append(escapeHtml(imageSrc))
                .append("' class='profile-image' style='").append(imgStyleStr)
                .append("object-fit: cover; border-radius: 4px; display: block;' alt='Profile' />");
        }
        
        html.append("<div class='name'>").append(escapeHtml(resume.getPersonalInfo().getFullName() != null ? resume.getPersonalInfo().getFullName() : "Your Name")).append("</div>");
        html.append("<div class='title'>").append(escapeHtml(resume.getPersonalInfo().getTitle() != null ? resume.getPersonalInfo().getTitle() : "Your Title")).append("</div>");
        html.append("<div class='contact-info'>");
        
        if (resume.getPersonalInfo().getEmail() != null && !resume.getPersonalInfo().getEmail().trim().isEmpty()) {
            html.append("<span>").append(escapeHtml(resume.getPersonalInfo().getEmail())).append("</span>");
        }
        if (resume.getPersonalInfo().getPhone() != null && !resume.getPersonalInfo().getPhone().trim().isEmpty()) {
            html.append("<span>").append(escapeHtml(resume.getPersonalInfo().getPhone())).append("</span>");
        }
        if (resume.getPersonalInfo().getLocation() != null && !resume.getPersonalInfo().getLocation().trim().isEmpty()) {
            html.append("<span>").append(escapeHtml(resume.getPersonalInfo().getLocation())).append("</span>");
        }
        
        html.append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String generateSummarySection(Resume resume) {
        if (resume.getSummary() == null || resume.getSummary().trim().isEmpty()) return "";
        
        String sectionTitle = getSectionTitle(resume, "summary", "Professional Summary");
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<div class='section-title'>").append(escapeHtml(sectionTitle)).append("</div>");
        html.append("<div class='section-content'>").append(escapeHtml(resume.getSummary())).append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String generateBioSection(Resume resume) {
        if (resume.getBio() == null || resume.getBio().trim().isEmpty()) return "";
        
        String sectionTitle = getSectionTitle(resume, "bio", "About Me");
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<div class='section-title'>").append(escapeHtml(sectionTitle)).append("</div>");
        html.append("<div class='section-content'>").append(escapeHtml(resume.getBio())).append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String generateExperienceSection(Resume resume) {
        if (resume.getExperience() == null || resume.getExperience().isEmpty()) return "";
        
        String sectionTitle = getSectionTitle(resume, "experience", "Professional Experience");
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<div class='section-title'>").append(escapeHtml(sectionTitle)).append("</div>");
        html.append("<div class='section-content'>");
        
        resume.getExperience().forEach(exp -> {
            if (isExperienceValid(exp)) {
                html.append("<div class='experience-item'>");
                html.append("<div class='item-header'>");
                html.append("<div class='item-title'>").append(escapeHtml(exp.getRole())).append("</div>");
                html.append("<div class='item-date'>").append(escapeHtml(exp.getStartDate() != null ? exp.getStartDate() : ""))
                    .append(" - ").append(escapeHtml(exp.getEndDate() != null ? exp.getEndDate() : "")).append("</div>");
                html.append("</div>");
                html.append("<div class='item-company'>").append(escapeHtml(exp.getCompany())).append("</div>");
                
                if (exp.getAchievements() != null && !exp.getAchievements().isEmpty()) {
                    html.append("<ul class='bullet-list'>");
                    exp.getAchievements().forEach(achievement -> {
                        if (achievement != null && !achievement.trim().isEmpty()) {
                            html.append("<li>").append(escapeHtml(achievement)).append("</li>");
                        }
                    });
                    html.append("</ul>");
                }
                html.append("</div>");
            }
        });
        
        html.append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String generateEducationSection(Resume resume) {
        if (resume.getEducation() == null || resume.getEducation().isEmpty()) return "";
        
        String sectionTitle = getSectionTitle(resume, "education", "Education");
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<div class='section-title'>").append(escapeHtml(sectionTitle)).append("</div>");
        html.append("<div class='section-content'>");
        
        resume.getEducation().forEach(edu -> {
            if (isEducationValid(edu)) {
                html.append("<div class='education-item'>");
                html.append("<div class='item-header'>");
                html.append("<div class='item-title'>").append(escapeHtml(edu.getDegree())).append("</div>");
                html.append("<div class='item-date'>").append(escapeHtml(edu.getStartDate() != null ? edu.getStartDate() : ""))
                    .append(" - ").append(escapeHtml(edu.getEndDate() != null ? edu.getEndDate() : "")).append("</div>");
                html.append("</div>");
                html.append("<div class='item-company'>").append(escapeHtml(edu.getInstitution())).append("</div>");
                if (edu.getFieldOfStudy() != null && !edu.getFieldOfStudy().trim().isEmpty()) {
                    html.append("<div class='section-content'>").append(escapeHtml(edu.getFieldOfStudy())).append("</div>");
                }
                html.append("</div>");
            }
        });
        
        html.append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String generateProjectsSection(Resume resume) {
        if (resume.getProjects() == null || resume.getProjects().isEmpty()) return "";
        
        String sectionTitle = getSectionTitle(resume, "projects", "Projects");
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<div class='section-title'>").append(escapeHtml(sectionTitle)).append("</div>");
        html.append("<div class='section-content'>");
        
        resume.getProjects().forEach(project -> {
            if (isProjectValid(project)) {
                html.append("<div class='experience-item'>");
                html.append("<div class='item-title'>").append(escapeHtml(project.getName())).append("</div>");
                if (project.getDescription() != null && !project.getDescription().trim().isEmpty()) {
                    html.append("<div class='section-content'>").append(escapeHtml(project.getDescription())).append("</div>");
                }
                if (project.getTechnologies() != null && !project.getTechnologies().isEmpty()) {
                    html.append("<div class='skills-container'>");
                    project.getTechnologies().forEach(tech -> {
                        if (tech != null && !tech.trim().isEmpty()) {
                            html.append("<span class='skill-tag'>").append(escapeHtml(tech)).append("</span>");
                        }
                    });
                    html.append("</div>");
                }
                html.append("</div>");
            }
        });
        
        html.append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String generateSkillsSection(Resume resume) {
        if (resume.getSkills() == null || resume.getSkills().isEmpty()) return "";
        
        String sectionTitle = getSectionTitle(resume, "skills", "Skills");
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<div class='section-title'>").append(escapeHtml(sectionTitle)).append("</div>");
        html.append("<div class='section-content'>");
        html.append("<div class='skills-container'>");
        
        resume.getSkills().forEach(skill -> {
            if (skill != null && !skill.trim().isEmpty()) {
                html.append("<span class='skill-tag'>").append(escapeHtml(skill)).append("</span>");
            }
        });
        
        html.append("</div>");
        html.append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String generateAchievementsSection(Resume resume) {
        if (resume.getAchievements() == null || resume.getAchievements().isEmpty()) return "";
        
        String sectionTitle = getSectionTitle(resume, "achievements", "Key Achievements");
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<div class='section-title'>").append(escapeHtml(sectionTitle)).append("</div>");
        html.append("<div class='section-content'>");
        html.append("<ul class='bullet-list'>");
        
        resume.getAchievements().forEach(achievement -> {
            if (achievement != null && !achievement.trim().isEmpty()) {
                html.append("<li>").append(escapeHtml(achievement)).append("</li>");
            }
        });
        
        html.append("</ul>");
        html.append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String generateCertificatesSection(Resume resume) {
        if (resume.getCertificates() == null || resume.getCertificates().isEmpty()) return "";
        
        String sectionTitle = getSectionTitle(resume, "certificates", "Certifications");
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<div class='section-title'>").append(escapeHtml(sectionTitle)).append("</div>");
        html.append("<div class='section-content'>");
        
        resume.getCertificates().forEach(cert -> {
            if (isCertificateValid(cert)) {
                html.append("<div class='education-item'>");
                html.append("<div class='item-title'>").append(escapeHtml(cert.getName())).append("</div>");
                html.append("<div class='item-company'>").append(escapeHtml(cert.getIssuer()));
                if (cert.getIssueDate() != null && !cert.getIssueDate().trim().isEmpty()) {
                    html.append(" (").append(escapeHtml(cert.getIssueDate())).append(")");
                }
                html.append("</div>");
                html.append("</div>");
            }
        });
        
        html.append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String generateLanguagesSection(Resume resume) {
        if (resume.getLanguages() == null || resume.getLanguages().isEmpty()) return "";
        
        String sectionTitle = getSectionTitle(resume, "languages", "Languages");
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<div class='section-title'>").append(escapeHtml(sectionTitle)).append("</div>");
        html.append("<div class='section-content'>");
        
        resume.getLanguages().forEach(lang -> {
            if (isLanguageValid(lang)) {
                html.append("<div class='item-header'>");
                html.append("<div class='item-title'>").append(escapeHtml(lang.getName())).append("</div>");
                html.append("<div class='item-date'>").append(escapeHtml(lang.getProficiency())).append("</div>");
                html.append("</div>");
            }
        });
        
        html.append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String generateHobbiesSection(Resume resume) {
        if (resume.getHobbies() == null || resume.getHobbies().isEmpty()) return "";
        
        String sectionTitle = getSectionTitle(resume, "hobbies", "Interests & Hobbies");
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<div class='section-title'>").append(escapeHtml(sectionTitle)).append("</div>");
        html.append("<div class='section-content'>");
        html.append("<div class='skills-container'>");
        
        resume.getHobbies().forEach(hobby -> {
            if (hobby != null && !hobby.trim().isEmpty()) {
                html.append("<span class='skill-tag'>").append(escapeHtml(hobby)).append("</span>");
            }
        });
        
        html.append("</div>");
        html.append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String getSectionTitle(Resume resume, String sectionId, String defaultTitle) {
        if (resume.getSectionTitles() != null && resume.getSectionTitles().containsKey(sectionId)) {
            String customTitle = resume.getSectionTitles().get(sectionId);
            if (customTitle != null && !customTitle.trim().isEmpty()) {
                return customTitle;
            }
        }
        return defaultTitle;
    }

    private boolean hasSectionContent(Resume resume, String sectionId) {
        switch (sectionId) {
            case "personalInfo":
                return resume.getPersonalInfo() != null;
            case "summary":
                return resume.getSummary() != null && !resume.getSummary().trim().isEmpty();
            case "bio":
                return resume.getBio() != null && !resume.getBio().trim().isEmpty();
            case "experience":
                return resume.getExperience() != null && !resume.getExperience().isEmpty();
            case "education":
                return resume.getEducation() != null && !resume.getEducation().isEmpty();
            case "projects":
                return resume.getProjects() != null && !resume.getProjects().isEmpty();
            case "skills":
                return resume.getSkills() != null && !resume.getSkills().isEmpty();
            case "achievements":
                return resume.getAchievements() != null && !resume.getAchievements().isEmpty();
            case "certificates":
                return resume.getCertificates() != null && !resume.getCertificates().isEmpty();
            case "languages":
                return resume.getLanguages() != null && !resume.getLanguages().isEmpty();
            case "hobbies":
                return resume.getHobbies() != null && !resume.getHobbies().isEmpty();
            default:
                return false;
        }
    }

    private List<List<String>> splitIntoPages(List<String> sections) {
        // Simple page splitting - can be enhanced with height calculations
        List<List<String>> pages = new ArrayList<>();
        if (sections.isEmpty()) {
            pages.add(new ArrayList<>());
            return pages;
        }
        
        // For now, put all sections on one page
        // In production, you'd calculate heights and split appropriately
        pages.add(new ArrayList<>(sections));
        return pages;
    }

    private String getCompleteCss(String primaryColor, String secondaryColor, String accentColor, String layoutType) {
        StringBuilder css = new StringBuilder();
        
        // Base styles
        css.append("* { box-sizing: border-box; margin: 0; padding: 0; } ");
        css.append("@page { size: A4; margin: 0; } ");
        css.append("html, body { width: 100%; height: 100%; margin: 0; padding: 0; background: white; position: relative; } ");
        css.append("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 12px; line-height: 1.6; color: #333; } ");
        
        // A4 page styles - positioned at top-left with no margins
        css.append(".a4-page { width: ").append(A4_WIDTH).append("px; min-height: ").append(A4_HEIGHT).append("px; padding: ").append(A4_PADDING).append("px; background: white; margin: 0; position: relative; page-break-after: always; page-break-inside: avoid; box-shadow: none; border: none; } ");
        css.append(".page-number { position: absolute; bottom: 4px; right: 4px; font-size: 10px; color: #9ca3af; } ");
        
        // Resume container and layout
        css.append(".resume-container { width: 100%; } ");
        css.append(".resume-container.sidebar { display: flex; gap: 20px; } ");
        css.append(".resume-container.sidebar .sidebar { width: 250px; flex-shrink: 0; } ");
        css.append(".resume-container.sidebar .main-content { flex: 1; } ");
        css.append(".resume-container.two-column { display: flex; gap: 20px; } ");
        css.append(".resume-container.two-column .left-column, .resume-container.two-column .right-column { flex: 1; } ");
        
        // Header section
        css.append(".header-section { margin-bottom: 20px; } ");
        css.append(".header-section.sidebar-header { text-align: left; } ");
        css.append(".name { font-size: 24px; font-weight: bold; color: ").append(primaryColor).append("; margin: 0 0 4px 0; } ");
        css.append(".title { font-size: 16px; color: ").append(secondaryColor).append("; margin: 0 0 12px 0; font-weight: 500; } ");
        css.append(".contact-info { font-size: 11px; color: ").append(secondaryColor).append("; display: flex; flex-wrap: wrap; gap: 8px; } ");
        css.append(".contact-info span { margin: 0; } ");
        css.append(".profile-image { display: block; margin-bottom: 12px; } ");
        
        // Section styles
        css.append(".section { margin-bottom: 20px; page-break-inside: avoid; } ");
        css.append(".section-title { font-size: 14px; font-weight: bold; color: ").append(primaryColor).append("; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid ").append(accentColor).append("; padding-bottom: 4px; } ");
        css.append(".section-content { font-size: 11px; line-height: 1.6; color: #374151; } ");
        
        // Item styles
        css.append(".experience-item, .education-item { margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; } ");
        css.append(".experience-item:last-child, .education-item:last-child { border-bottom: none; } ");
        css.append(".item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; } ");
        css.append(".item-title { font-size: 13px; font-weight: 600; color: ").append(primaryColor).append("; margin: 0; } ");
        css.append(".item-company { font-size: 11px; color: ").append(secondaryColor).append("; font-weight: 500; margin: 2px 0; } ");
        css.append(".item-date { font-size: 10px; color: ").append(secondaryColor).append("; font-style: italic; } ");
        
        // Lists
        css.append(".bullet-list { margin: 8px 0; padding-left: 20px; list-style-type: disc; } ");
        css.append(".bullet-list li { margin-bottom: 4px; font-size: 11px; line-height: 1.5; } ");
        
        // Skills and tags
        css.append(".skills-container { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; } ");
        css.append(".skill-tag { background-color: ").append(accentColor).append("; color: white; padding: 4px 10px; border-radius: 4px; font-size: 10px; display: inline-block; } ");
        
        // Print-specific styles to ensure proper alignment and no shadows
        css.append("@media print { ");
        css.append("html, body { margin: 0; padding: 0; background: white !important; } ");
        css.append(".a4-page { margin: 0 !important; border: none !important; box-shadow: none !important; page-break-after: always; } ");
        css.append("} ");
        
        return css.toString();
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                  .replace("<", "&lt;")
                  .replace(">", "&gt;")
                  .replace("\"", "&quot;")
                  .replace("'", "&#39;");
    }

    private boolean isExperienceValid(Resume.Experience exp) {
        return exp != null && 
               (exp.getRole() != null && !exp.getRole().trim().isEmpty()) &&
               (exp.getCompany() != null && !exp.getCompany().trim().isEmpty());
    }

    private boolean isEducationValid(Resume.Education edu) {
        return edu != null && 
               (edu.getDegree() != null && !edu.getDegree().trim().isEmpty()) &&
               (edu.getInstitution() != null && !edu.getInstitution().trim().isEmpty());
    }

    private boolean isProjectValid(Resume.Project project) {
        return project != null && 
               (project.getName() != null && !project.getName().trim().isEmpty());
    }

    private boolean isCertificateValid(Resume.Certificate cert) {
        return cert != null && 
               (cert.getName() != null && !cert.getName().trim().isEmpty()) &&
               (cert.getIssuer() != null && !cert.getIssuer().trim().isEmpty());
    }

    private boolean isLanguageValid(Resume.Language lang) {
        return lang != null && 
               (lang.getName() != null && !lang.getName().trim().isEmpty()) &&
               (lang.getProficiency() != null && !lang.getProficiency().trim().isEmpty());
    }
}
