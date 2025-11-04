package com.careerconnect.service;

import com.careerconnect.model.Resume;
import com.careerconnect.model.ResumeTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PdfRenderService {

    public byte[] render(Resume resume, ResumeTemplate template) {
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

    private byte[] generatePdfWithIText(Resume resume, ResumeTemplate template) {
        try {
            // Generate HTML content
            String htmlContent = generateHtmlContent(resume, template);
            System.out.println("Generated HTML content length: " + htmlContent.length());
            
            // Use reflection to avoid compilation issues
            Class<?> htmlConverterClass = Class.forName("com.itextpdf.html2pdf.HtmlConverter");
            Class<?> pdfWriterClass = Class.forName("com.itextpdf.kernel.pdf.PdfWriter");
            Class<?> pdfDocumentClass = Class.forName("com.itextpdf.kernel.pdf.PdfDocument");
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Object writer = pdfWriterClass.getConstructor(ByteArrayOutputStream.class).newInstance(outputStream);
            Object pdfDoc = pdfDocumentClass.getConstructor(pdfWriterClass).newInstance(writer);
            
            // Convert HTML to PDF
            htmlConverterClass.getMethod("convertToPdf", String.class, pdfDocumentClass)
                .invoke(null, htmlContent, pdfDoc);
            
            pdfDocumentClass.getMethod("close").invoke(pdfDoc);
            
            byte[] result = outputStream.toByteArray();
            System.out.println("Generated PDF size: " + result.length + " bytes");
            return result;
        } catch (Exception e) {
            System.err.println("iText PDF generation error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("iText PDF generation failed", e);
        }
    }

    private byte[] generateSimplePdf(Resume resume) {
        // Generate a simple PDF structure with proper formatting
        StringBuilder pdfContent = new StringBuilder();
        
        // PDF Header
        pdfContent.append("%PDF-1.4\n");
        pdfContent.append("1 0 obj\n");
        pdfContent.append("<</Type/Catalog/Pages 2 0 R>>\n");
        pdfContent.append("endobj\n");
        
        // Pages object
        pdfContent.append("2 0 obj\n");
        pdfContent.append("<</Type/Pages/Count 1/Kids[3 0 R]>>\n");
        pdfContent.append("endobj\n");
        
        // Page object
        pdfContent.append("3 0 obj\n");
        pdfContent.append("<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R/F2 6 0 R>>>>>>\n");
        pdfContent.append("endobj\n");
        
        // Content stream with proper formatting
        String content = generateFormattedText(resume);
        String contentStream = generateFormattedContentStream(content);
        
        pdfContent.append("4 0 obj\n");
        pdfContent.append("<</Length ").append(contentStream.length()).append(">>\n");
        pdfContent.append("stream\n");
        pdfContent.append(contentStream).append("\n");
        pdfContent.append("endstream\n");
        pdfContent.append("endobj\n");
        
        // Font objects
        pdfContent.append("5 0 obj\n");
        pdfContent.append("<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold>>\n");
        pdfContent.append("endobj\n");
        
        pdfContent.append("6 0 obj\n");
        pdfContent.append("<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>\n");
        pdfContent.append("endobj\n");
        
        // Cross-reference table
        pdfContent.append("xref\n");
        pdfContent.append("0 7\n");
        pdfContent.append("0000000000 65535 f \n");
        pdfContent.append("0000000009 00000 n \n");
        pdfContent.append("0000000058 00000 n \n");
        pdfContent.append("0000000115 00000 n \n");
        pdfContent.append("0000000206 00000 n \n");
        pdfContent.append("0000000380 00000 n \n");
        pdfContent.append("0000000450 00000 n \n");
        
        // Trailer
        pdfContent.append("trailer\n");
        pdfContent.append("<</Root 1 0 R/Size 7>>\n");
        pdfContent.append("startxref\n");
        pdfContent.append("520\n");
        pdfContent.append("%%EOF\n");
        
        return pdfContent.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    private String generateFormattedContentStream(String content) {
        StringBuilder stream = new StringBuilder();
        String[] lines = content.split("\n");
        int yPosition = 750;
        
        stream.append("BT\n");
        
        for (String line : lines) {
            if (yPosition < 50) {
                // Start new page if needed
                stream.append("ET\n");
                stream.append("BT\n");
                yPosition = 750;
            }
            
            if (line.trim().isEmpty()) {
                yPosition -= 15; // Empty line spacing
                continue;
            }
            
            // Check if it's a section header (all caps)
            if (line.matches("^[A-Z\\s]+$") && line.length() > 3) {
                stream.append("/F1 14 Tf\n"); // Bold font for headers
                stream.append("50 ").append(yPosition).append(" Td\n");
                stream.append("(").append(escapePdfText(line)).append(") Tj\n");
                stream.append("0 -20 Td\n"); // Move down for next line
                yPosition -= 25;
            } else {
                stream.append("/F2 10 Tf\n"); // Regular font for content
                stream.append("50 ").append(yPosition).append(" Td\n");
                stream.append("(").append(escapePdfText(line)).append(") Tj\n");
                stream.append("0 -15 Td\n"); // Move down for next line
                yPosition -= 15;
            }
        }
        
        stream.append("ET\n");
        return stream.toString();
    }

    private String generateFormattedText(Resume resume) {
        StringBuilder sb = new StringBuilder();
        
        // Header Section
        if (resume.getPersonalInfo() != null) {
            sb.append(resume.getPersonalInfo().getFullName()).append("\n");
            sb.append(resume.getPersonalInfo().getTitle()).append("\n");
            sb.append(resume.getPersonalInfo().getEmail()).append(" | ");
            sb.append(resume.getPersonalInfo().getPhone()).append(" | ");
            sb.append(resume.getPersonalInfo().getLocation()).append("\n\n");
        }
        
        // Summary Section
        if (resume.getSummary() != null && !resume.getSummary().trim().isEmpty()) {
            sb.append("PROFESSIONAL SUMMARY\n");
            sb.append(resume.getSummary()).append("\n\n");
        }
        
        // Bio Section
        if (resume.getBio() != null && !resume.getBio().trim().isEmpty()) {
            sb.append("ABOUT ME\n");
            sb.append(resume.getBio()).append("\n\n");
        }
        
        // Experience Section
        if (resume.getExperience() != null && !resume.getExperience().isEmpty()) {
            sb.append("PROFESSIONAL EXPERIENCE\n");
            resume.getExperience().forEach(exp -> {
                if (isExperienceValid(exp)) {
                    sb.append(exp.getRole()).append(" - ").append(exp.getCompany()).append("\n");
                    sb.append(exp.getStartDate()).append(" - ").append(exp.getEndDate()).append("\n");
                    if (exp.getAchievements() != null && !exp.getAchievements().isEmpty()) {
                        exp.getAchievements().forEach(achievement -> {
                            if (achievement != null && !achievement.trim().isEmpty()) {
                                sb.append("• ").append(achievement).append("\n");
                            }
                        });
                    }
                    sb.append("\n");
                }
            });
        }
        
        // Education Section
        if (resume.getEducation() != null && !resume.getEducation().isEmpty()) {
            sb.append("EDUCATION\n");
            resume.getEducation().forEach(edu -> {
                if (isEducationValid(edu)) {
                    sb.append(edu.getDegree()).append("\n");
                    sb.append(edu.getInstitution());
                    if (edu.getFieldOfStudy() != null && !edu.getFieldOfStudy().trim().isEmpty()) {
                        sb.append(" - ").append(edu.getFieldOfStudy());
                    }
                    sb.append("\n");
                    sb.append(edu.getStartDate()).append(" - ").append(edu.getEndDate()).append("\n\n");
                }
            });
        }
        
        // Projects Section
        if (resume.getProjects() != null && !resume.getProjects().isEmpty()) {
            sb.append("PROJECTS\n");
            resume.getProjects().forEach(project -> {
                if (isProjectValid(project)) {
                    sb.append(project.getName()).append("\n");
                    if (project.getDescription() != null && !project.getDescription().trim().isEmpty()) {
                        sb.append(project.getDescription()).append("\n");
                    }
                    if (project.getTechnologies() != null && !project.getTechnologies().isEmpty()) {
                        sb.append("Technologies: ").append(String.join(", ", project.getTechnologies())).append("\n");
                    }
                    sb.append("\n");
                }
            });
        }
        
        // Skills Section
        if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
            sb.append("SKILLS\n");
            sb.append(String.join(", ", resume.getSkills())).append("\n\n");
        }
        
        // Achievements Section
        if (resume.getAchievements() != null && !resume.getAchievements().isEmpty()) {
            sb.append("KEY ACHIEVEMENTS\n");
            resume.getAchievements().forEach(achievement -> {
                if (achievement != null && !achievement.trim().isEmpty()) {
                    sb.append("• ").append(achievement).append("\n");
                }
            });
            sb.append("\n");
        }
        
        // Certificates Section
        if (resume.getCertificates() != null && !resume.getCertificates().isEmpty()) {
            sb.append("CERTIFICATIONS\n");
            resume.getCertificates().forEach(cert -> {
                if (isCertificateValid(cert)) {
                    sb.append(cert.getName()).append(" - ").append(cert.getIssuer());
                    if (cert.getIssueDate() != null && !cert.getIssueDate().trim().isEmpty()) {
                        sb.append(" (").append(cert.getIssueDate()).append(")");
                    }
                    sb.append("\n");
                }
            });
            sb.append("\n");
        }
        
        // Languages Section
        if (resume.getLanguages() != null && !resume.getLanguages().isEmpty()) {
            sb.append("LANGUAGES\n");
            resume.getLanguages().forEach(lang -> {
                if (isLanguageValid(lang)) {
                    sb.append(lang.getName()).append(" - ").append(lang.getProficiency()).append("\n");
                }
            });
            sb.append("\n");
        }
        
        // Hobbies Section
        if (resume.getHobbies() != null && !resume.getHobbies().isEmpty()) {
            sb.append("INTERESTS & HOBBIES\n");
            sb.append(String.join(", ", resume.getHobbies())).append("\n\n");
        }
        
        return sb.toString();
    }

    private String escapePdfText(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                  .replace("(", "\\(")
                  .replace(")", "\\)")
                  .replace("[", "\\[")
                  .replace("]", "\\]");
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
        
        // Start HTML document with CSS
        html.append("<!DOCTYPE html><html><head><style>");
        html.append(getDefaultCss(primaryColor, secondaryColor, accentColor));
        if (template.getCss() != null) {
            html.append(template.getCss());
        }
        html.append("</style></head><body>");

        // Use section order if available, otherwise use default order
        List<String> sectionOrder = resume.getSectionOrder();
        if (sectionOrder == null || sectionOrder.isEmpty()) {
            sectionOrder = List.of(
                "personalInfo", "summary", "bio", "experience", "education", 
                "projects", "skills", "achievements", "certificates", "languages", "hobbies"
            );
        }

        // Generate sections in the specified order
        for (String sectionId : sectionOrder) {
            String sectionHtml = generateSectionHtml(resume, sectionId);
            if (sectionHtml != null && !sectionHtml.trim().isEmpty()) {
                html.append(sectionHtml);
            }
        }

        html.append("</body></html>");
        return html.toString();
    }

    private String generateSectionHtml(Resume resume, String sectionId) {
        switch (sectionId) {
            case "personalInfo":
                return generatePersonalInfoSection(resume);
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
                return null;
        }
    }

    private String generatePersonalInfoSection(Resume resume) {
        if (resume.getPersonalInfo() == null) return null;
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='header'>");
        html.append("<h1 class='name'>").append(escapeHtml(resume.getPersonalInfo().getFullName())).append("</h1>");
        html.append("<h2 class='title'>").append(escapeHtml(resume.getPersonalInfo().getTitle())).append("</h2>");
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
        if (resume.getSummary() == null || resume.getSummary().trim().isEmpty()) return null;
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<h3 class='section-title'>Professional Summary</h3>");
        html.append("<p class='summary'>").append(escapeHtml(resume.getSummary())).append("</p>");
        html.append("</div>");
        return html.toString();
    }

    private String generateBioSection(Resume resume) {
        if (resume.getBio() == null || resume.getBio().trim().isEmpty()) return null;
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<h3 class='section-title'>About Me</h3>");
        html.append("<p class='bio'>").append(escapeHtml(resume.getBio())).append("</p>");
        html.append("</div>");
        return html.toString();
    }

    private String generateSkillsSection(Resume resume) {
        if (resume.getSkills() == null || resume.getSkills().isEmpty()) return null;
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<h3 class='section-title'>Skills</h3>");
        html.append("<div class='skills'>");
        resume.getSkills().forEach(skill -> {
            if (skill != null && !skill.trim().isEmpty()) {
                html.append("<span class='skill-tag'>").append(escapeHtml(skill)).append("</span>");
            }
        });
        html.append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String generateExperienceSection(Resume resume) {
        if (resume.getExperience() == null || resume.getExperience().isEmpty()) return null;
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<h3 class='section-title'>Professional Experience</h3>");
        resume.getExperience().forEach(exp -> {
            if (isExperienceValid(exp)) {
                html.append("<div class='experience-item'>");
                html.append("<div class='experience-header'>");
                html.append("<h4 class='role'>").append(escapeHtml(exp.getRole())).append("</h4>");
                html.append("<span class='company'>").append(escapeHtml(exp.getCompany())).append("</span>");
                html.append("<span class='duration'>").append(escapeHtml(exp.getStartDate())).append(" - ").append(escapeHtml(exp.getEndDate())).append("</span>");
                html.append("</div>");
                if (exp.getAchievements() != null && !exp.getAchievements().isEmpty()) {
                    html.append("<ul class='achievements'>");
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
        return html.toString();
    }

    private String generateEducationSection(Resume resume) {
        if (resume.getEducation() == null || resume.getEducation().isEmpty()) return null;
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<h3 class='section-title'>Education</h3>");
        resume.getEducation().forEach(edu -> {
            if (isEducationValid(edu)) {
                html.append("<div class='education-item'>");
                html.append("<h4 class='degree'>").append(escapeHtml(edu.getDegree())).append("</h4>");
                html.append("<span class='institution'>").append(escapeHtml(edu.getInstitution())).append("</span>");
                if (edu.getFieldOfStudy() != null && !edu.getFieldOfStudy().trim().isEmpty()) {
                    html.append("<span class='field'>").append(escapeHtml(edu.getFieldOfStudy())).append("</span>");
                }
                html.append("<span class='duration'>").append(escapeHtml(edu.getStartDate())).append(" - ").append(escapeHtml(edu.getEndDate())).append("</span>");
                html.append("</div>");
            }
        });
        html.append("</div>");
        return html.toString();
    }

    private String generateProjectsSection(Resume resume) {
        if (resume.getProjects() == null || resume.getProjects().isEmpty()) return null;
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<h3 class='section-title'>Projects</h3>");
        resume.getProjects().forEach(project -> {
            if (isProjectValid(project)) {
                html.append("<div class='project-item'>");
                html.append("<h4 class='project-name'>").append(escapeHtml(project.getName())).append("</h4>");
                if (project.getDescription() != null && !project.getDescription().trim().isEmpty()) {
                    html.append("<p class='project-description'>").append(escapeHtml(project.getDescription())).append("</p>");
                }
                if (project.getTechnologies() != null && !project.getTechnologies().isEmpty()) {
                    html.append("<div class='technologies'>");
                    project.getTechnologies().forEach(tech -> {
                        if (tech != null && !tech.trim().isEmpty()) {
                            html.append("<span class='tech-tag'>").append(escapeHtml(tech)).append("</span>");
                        }
                    });
                    html.append("</div>");
                }
                html.append("</div>");
            }
        });
        html.append("</div>");
        return html.toString();
    }

    private String generateAchievementsSection(Resume resume) {
        if (resume.getAchievements() == null || resume.getAchievements().isEmpty()) return null;
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<h3 class='section-title'>Key Achievements</h3>");
        html.append("<ul class='achievements-list'>");
        resume.getAchievements().forEach(achievement -> {
            if (achievement != null && !achievement.trim().isEmpty()) {
                html.append("<li>").append(escapeHtml(achievement)).append("</li>");
            }
        });
        html.append("</ul>");
        html.append("</div>");
        return html.toString();
    }

    private String generateCertificatesSection(Resume resume) {
        if (resume.getCertificates() == null || resume.getCertificates().isEmpty()) return null;
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<h3 class='section-title'>Certifications</h3>");
        resume.getCertificates().forEach(cert -> {
            if (isCertificateValid(cert)) {
                html.append("<div class='certificate-item'>");
                html.append("<h4 class='cert-name'>").append(escapeHtml(cert.getName())).append("</h4>");
                html.append("<span class='cert-issuer'>").append(escapeHtml(cert.getIssuer())).append("</span>");
                if (cert.getIssueDate() != null && !cert.getIssueDate().trim().isEmpty()) {
                    html.append("<span class='cert-date'>").append(escapeHtml(cert.getIssueDate())).append("</span>");
                }
                html.append("</div>");
            }
        });
        html.append("</div>");
        return html.toString();
    }

    private String generateLanguagesSection(Resume resume) {
        if (resume.getLanguages() == null || resume.getLanguages().isEmpty()) return null;
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<h3 class='section-title'>Languages</h3>");
        html.append("<div class='languages'>");
        resume.getLanguages().forEach(lang -> {
            if (isLanguageValid(lang)) {
                html.append("<div class='language-item'>");
                html.append("<span class='lang-name'>").append(escapeHtml(lang.getName())).append("</span>");
                html.append("<span class='lang-proficiency'>").append(escapeHtml(lang.getProficiency())).append("</span>");
                html.append("</div>");
            }
        });
        html.append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String generateHobbiesSection(Resume resume) {
        if (resume.getHobbies() == null || resume.getHobbies().isEmpty()) return null;
        
        StringBuilder html = new StringBuilder();
        html.append("<div class='section'>");
        html.append("<h3 class='section-title'>Interests & Hobbies</h3>");
        html.append("<div class='hobbies'>");
        resume.getHobbies().forEach(hobby -> {
            if (hobby != null && !hobby.trim().isEmpty()) {
                html.append("<span class='hobby-tag'>").append(escapeHtml(hobby)).append("</span>");
            }
        });
        html.append("</div>");
        html.append("</div>");
        return html.toString();
    }

    private String getDefaultCss(String primaryColor, String secondaryColor, String accentColor) {
        return "body {" +
                "font-family: Arial, sans-serif;" +
                "font-size: 12px;" +
                "line-height: 1.5;" +
                "color: #333333;" +
                "margin: 0;" +
                "padding: 20px;" +
                "background-color: white;" +
                "}" +
                ".header {" +
                "text-align: center;" +
                "margin-bottom: 25px;" +
                "border-bottom: 3px solid " + primaryColor + ";" +
                "padding-bottom: 20px;" +
                "}" +
                ".name {" +
                "font-size: 28px;" +
                "font-weight: bold;" +
                "color: " + primaryColor + ";" +
                "margin: 0 0 8px 0;" +
                "}" +
                ".title {" +
                "font-size: 18px;" +
                "color: " + secondaryColor + ";" +
                "margin: 0 0 15px 0;" +
                "font-weight: normal;" +
                "}" +
                ".contact-info {" +
                "font-size: 12px;" +
                "color: " + secondaryColor + ";" +
                "}" +
                ".contact-info span {" +
                "margin: 0 15px;" +
                "}" +
                ".section {" +
                "margin-bottom: 20px;" +
                "page-break-inside: avoid;" +
                "}" +
                ".section-title {" +
                "font-size: 16px;" +
                "font-weight: bold;" +
                "color: " + primaryColor + ";" +
                "margin: 0 0 12px 0;" +
                "text-transform: uppercase;" +
                "letter-spacing: 1px;" +
                "border-bottom: 1px solid " + accentColor + ";" +
                "padding-bottom: 5px;" +
                "}" +
                ".summary, .bio {" +
                "margin: 0 0 10px 0;" +
                "text-align: justify;" +
                "font-size: 11px;" +
                "}" +
                ".skills {" +
                "margin: 10px 0;" +
                "}" +
                ".skill-tag, .tech-tag, .hobby-tag {" +
                "background-color: " + accentColor + ";" +
                "color: white;" +
                "padding: 3px 10px;" +
                "border-radius: 4px;" +
                "font-size: 10px;" +
                "margin: 2px 5px 2px 0;" +
                "display: inline-block;" +
                "}" +
                ".experience-item, .education-item, .project-item, .certificate-item {" +
                "margin-bottom: 15px;" +
                "padding-bottom: 10px;" +
                "border-bottom: 1px solid #eeeeee;" +
                "}" +
                ".experience-header {" +
                "margin-bottom: 8px;" +
                "}" +
                ".role, .degree, .project-name, .cert-name {" +
                "font-size: 14px;" +
                "font-weight: bold;" +
                "margin: 0 0 3px 0;" +
                "color: " + primaryColor + ";" +
                "}" +
                ".company, .institution, .cert-issuer {" +
                "font-size: 12px;" +
                "color: " + secondaryColor + ";" +
                "font-weight: bold;" +
                "margin: 0 0 3px 0;" +
                "}" +
                ".duration, .cert-date {" +
                "font-size: 10px;" +
                "color: " + secondaryColor + ";" +
                "font-style: italic;" +
                "}" +
                ".achievements, .achievements-list {" +
                "margin: 8px 0;" +
                "padding-left: 20px;" +
                "}" +
                ".achievements li, .achievements-list li {" +
                "margin-bottom: 4px;" +
                "font-size: 11px;" +
                "}" +
                ".technologies {" +
                "margin-top: 8px;" +
                "}" +
                ".languages {" +
                "margin: 10px 0;" +
                "}" +
                ".language-item {" +
                "margin-bottom: 5px;" +
                "}" +
                ".lang-name {" +
                "font-weight: bold;" +
                "margin-right: 10px;" +
                "}" +
                ".lang-proficiency {" +
                "color: " + secondaryColor + ";" +
                "font-style: italic;" +
                "}" +
                ".hobbies {" +
                "margin: 10px 0;" +
                "}" +
                ".project-description {" +
                "margin: 5px 0;" +
                "font-size: 11px;" +
                "}" +
                ".field {" +
                "font-size: 11px;" +
                "color: " + secondaryColor + ";" +
                "margin-left: 10px;" +
                "}";
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


