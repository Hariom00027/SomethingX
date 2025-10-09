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
            // Fallback to simple PDF generation
            return generateSimplePdf(resume);
        }
    }

    private byte[] generatePdfWithIText(Resume resume, ResumeTemplate template) {
        try {
            // Generate HTML content
            String htmlContent = generateHtmlContent(resume, template);
            
            // Use reflection to avoid compilation issues
            Class<?> htmlConverterClass = Class.forName("com.itextpdf.html2pdf.HtmlConverter");
            Class<?> pdfWriterClass = Class.forName("com.itextpdf.kernel.pdf.PdfWriter");
            Class<?> pdfDocumentClass = Class.forName("com.itextpdf.kernel.pdf.PdfDocument");
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Object writer = pdfWriterClass.getConstructor(ByteArrayOutputStream.class).newInstance(outputStream);
            Object pdfDoc = pdfDocumentClass.getConstructor(pdfWriterClass).newInstance(writer);
            
            htmlConverterClass.getMethod("convertToPdf", String.class, pdfDocumentClass)
                .invoke(null, htmlContent, pdfDoc);
            
            pdfDocumentClass.getMethod("close").invoke(pdfDoc);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("iText not available", e);
        }
    }

    private byte[] generateSimplePdf(Resume resume) {
        // Generate a simple PDF structure
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
        pdfContent.append("<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>\n");
        pdfContent.append("endobj\n");
        
        // Content stream
        String content = generateSimpleText(resume);
        String escapedContent = content.replace("(", "\\(").replace(")", "\\)").replace("\\", "\\\\");
        String contentStream = "BT /F1 12 Tf 50 740 Td (" + escapedContent + ") Tj ET";
        
        pdfContent.append("4 0 obj\n");
        pdfContent.append("<</Length ").append(contentStream.length()).append(">>\n");
        pdfContent.append("stream\n");
        pdfContent.append(contentStream).append("\n");
        pdfContent.append("endstream\n");
        pdfContent.append("endobj\n");
        
        // Font object
        pdfContent.append("5 0 obj\n");
        pdfContent.append("<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>\n");
        pdfContent.append("endobj\n");
        
        // Cross-reference table
        pdfContent.append("xref\n");
        pdfContent.append("0 6\n");
        pdfContent.append("0000000000 65535 f \n");
        pdfContent.append("0000000009 00000 n \n");
        pdfContent.append("0000000058 00000 n \n");
        pdfContent.append("0000000115 00000 n \n");
        pdfContent.append("0000000206 00000 n \n");
        pdfContent.append("0000000380 00000 n \n");
        
        // Trailer
        pdfContent.append("trailer\n");
        pdfContent.append("<</Root 1 0 R/Size 6>>\n");
        pdfContent.append("startxref\n");
        pdfContent.append("477\n");
        pdfContent.append("%%EOF\n");
        
        return pdfContent.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    public String generateHtmlContent(Resume resume, ResumeTemplate template) {
        StringBuilder html = new StringBuilder();
        
        // Start HTML document with CSS
        html.append("<!DOCTYPE html><html><head><style>");
        html.append(getDefaultCss(template));
        if (template.getCss() != null) {
            html.append(template.getCss());
        }
        html.append("</style></head><body>");

        // Header Section
        html.append("<div class='header'>");
        if (resume.getPersonalInfo() != null) {
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
        }
        html.append("</div>");

        // Summary Section (only if not empty)
        if (resume.getSummary() != null && !resume.getSummary().trim().isEmpty()) {
            html.append("<div class='section'>");
            html.append("<h3 class='section-title'>Professional Summary</h3>");
            html.append("<p class='summary'>").append(escapeHtml(resume.getSummary())).append("</p>");
            html.append("</div>");
        }

        // Bio Section (only if not empty)
        if (resume.getBio() != null && !resume.getBio().trim().isEmpty()) {
            html.append("<div class='section'>");
            html.append("<h3 class='section-title'>About Me</h3>");
            html.append("<p class='bio'>").append(escapeHtml(resume.getBio())).append("</p>");
            html.append("</div>");
        }

        // Skills Section (only if not empty)
        if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
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
        }

        // Experience Section (only if not empty)
        if (resume.getExperience() != null && !resume.getExperience().isEmpty()) {
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
        }

        // Education Section (only if not empty)
        if (resume.getEducation() != null && !resume.getEducation().isEmpty()) {
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
        }

        // Projects Section (only if not empty)
        if (resume.getProjects() != null && !resume.getProjects().isEmpty()) {
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
        }

        // Achievements Section (only if not empty)
        if (resume.getAchievements() != null && !resume.getAchievements().isEmpty()) {
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
        }

        // Certificates Section (only if not empty)
        if (resume.getCertificates() != null && !resume.getCertificates().isEmpty()) {
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
        }

        // Languages Section (only if not empty)
        if (resume.getLanguages() != null && !resume.getLanguages().isEmpty()) {
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
        }

        // Hobbies Section (only if not empty)
        if (resume.getHobbies() != null && !resume.getHobbies().isEmpty()) {
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
        }

        html.append("</body></html>");
        return html.toString();
    }

    private String getDefaultCss(ResumeTemplate template) {
        String primaryColor = template.getPrimaryColor() != null ? template.getPrimaryColor() : "#2563eb";
        String secondaryColor = template.getSecondaryColor() != null ? template.getSecondaryColor() : "#64748b";
        String accentColor = template.getAccentColor() != null ? template.getAccentColor() : "#3b82f6";

        return "body {" +
                "font-family: 'Arial', sans-serif;" +
                "font-size: 11px;" +
                "line-height: 1.4;" +
                "color: #333;" +
                "margin: 0;" +
                "padding: 20px;" +
                "}" +
                ".header {" +
                "text-align: center;" +
                "margin-bottom: 20px;" +
                "border-bottom: 2px solid " + primaryColor + ";" +
                "padding-bottom: 15px;" +
                "}" +
                ".name {" +
                "font-size: 24px;" +
                "font-weight: bold;" +
                "color: " + primaryColor + ";" +
                "margin: 0 0 5px 0;" +
                "}" +
                ".title {" +
                "font-size: 16px;" +
                "color: " + secondaryColor + ";" +
                "margin: 0 0 10px 0;" +
                "font-weight: normal;" +
                "}" +
                ".contact-info {" +
                "font-size: 10px;" +
                "color: " + secondaryColor + ";" +
                "}" +
                ".contact-info span {" +
                "margin: 0 10px;" +
                "}" +
                ".section {" +
                "margin-bottom: 15px;" +
                "}" +
                ".section-title {" +
                "font-size: 14px;" +
                "font-weight: bold;" +
                "color: " + primaryColor + ";" +
                "margin: 0 0 8px 0;" +
                "text-transform: uppercase;" +
                "letter-spacing: 1px;" +
                "}" +
                ".summary, .bio {" +
                "margin: 0;" +
                "text-align: justify;" +
                "}" +
                ".skills {" +
                "display: flex;" +
                "flex-wrap: wrap;" +
                "gap: 5px;" +
                "}" +
                ".skill-tag, .tech-tag, .hobby-tag {" +
                "background-color: " + accentColor + ";" +
                "color: white;" +
                "padding: 2px 8px;" +
                "border-radius: 3px;" +
                "font-size: 9px;" +
                "margin: 2px;" +
                "}" +
                ".experience-item, .education-item, .project-item, .certificate-item {" +
                "margin-bottom: 10px;" +
                "}" +
                ".experience-header {" +
                "display: flex;" +
                "justify-content: space-between;" +
                "align-items: center;" +
                "margin-bottom: 5px;" +
                "}" +
                ".role, .degree, .project-name, .cert-name {" +
                "font-size: 12px;" +
                "font-weight: bold;" +
                "margin: 0;" +
                "color: " + primaryColor + ";" +
                "}" +
                ".company, .institution, .cert-issuer {" +
                "font-size: 10px;" +
                "color: " + secondaryColor + ";" +
                "font-weight: bold;" +
                "}" +
                ".duration, .cert-date {" +
                "font-size: 9px;" +
                "color: " + secondaryColor + ";" +
                "font-style: italic;" +
                "}" +
                ".achievements, .achievements-list {" +
                "margin: 5px 0;" +
                "padding-left: 15px;" +
                "}" +
                ".achievements li, .achievements-list li {" +
                "margin-bottom: 3px;" +
                "font-size: 10px;" +
                "}" +
                ".technologies {" +
                "margin-top: 5px;" +
                "}" +
                ".languages {" +
                "display: flex;" +
                "flex-wrap: wrap;" +
                "gap: 10px;" +
                "}" +
                ".language-item {" +
                "display: flex;" +
                "justify-content: space-between;" +
                "min-width: 150px;" +
                "}" +
                ".lang-name {" +
                "font-weight: bold;" +
                "}" +
                ".lang-proficiency {" +
                "color: " + secondaryColor + ";" +
                "font-style: italic;" +
                "}" +
                ".hobbies {" +
                "display: flex;" +
                "flex-wrap: wrap;" +
                "gap: 5px;" +
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

    // Fallback method for simple text generation
    private String generateSimpleText(Resume resume) {
        StringBuilder sb = new StringBuilder();
        if (resume.getPersonalInfo() != null) {
            sb.append(nullToEmpty(resume.getPersonalInfo().getFullName())).append(" - ")
              .append(nullToEmpty(resume.getPersonalInfo().getTitle())).append("\n")
              .append(nullToEmpty(resume.getPersonalInfo().getEmail())).append(" | ")
              .append(nullToEmpty(resume.getPersonalInfo().getPhone())).append(" | ")
              .append(nullToEmpty(resume.getPersonalInfo().getLocation())).append("\n\n");
        }
        if (resume.getSummary() != null && !resume.getSummary().trim().isEmpty()) {
            sb.append("PROFESSIONAL SUMMARY\n").append(resume.getSummary()).append("\n\n");
        }
        if (resume.getBio() != null && !resume.getBio().trim().isEmpty()) {
            sb.append("ABOUT ME\n").append(resume.getBio()).append("\n\n");
        }
        if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
            sb.append("SKILLS\n").append(join(resume.getSkills())).append("\n\n");
        }
        if (resume.getAchievements() != null && !resume.getAchievements().isEmpty()) {
            sb.append("KEY ACHIEVEMENTS\n");
            resume.getAchievements().forEach(achievement -> {
                if (achievement != null && !achievement.trim().isEmpty()) {
                    sb.append("• ").append(achievement).append("\n");
                }
            });
            sb.append("\n");
        }
        if (resume.getCertificates() != null && !resume.getCertificates().isEmpty()) {
            sb.append("CERTIFICATIONS\n");
            resume.getCertificates().forEach(cert -> {
                if (isCertificateValid(cert)) {
                    sb.append("• ").append(cert.getName()).append(" - ").append(cert.getIssuer());
                    if (cert.getIssueDate() != null && !cert.getIssueDate().trim().isEmpty()) {
                        sb.append(" (").append(cert.getIssueDate()).append(")");
                    }
                    sb.append("\n");
                }
            });
            sb.append("\n");
        }
        if (resume.getLanguages() != null && !resume.getLanguages().isEmpty()) {
            sb.append("LANGUAGES\n");
            resume.getLanguages().forEach(lang -> {
                if (isLanguageValid(lang)) {
                    sb.append("• ").append(lang.getName()).append(" - ").append(lang.getProficiency()).append("\n");
                }
            });
            sb.append("\n");
        }
        if (resume.getHobbies() != null && !resume.getHobbies().isEmpty()) {
            sb.append("HOBBIES & INTERESTS\n").append(join(resume.getHobbies())).append("\n\n");
        }
        return sb.toString();
    }

    private String join(List<String> list) { 
        return list == null ? "" : list.stream().collect(Collectors.joining(", ")); 
    }
    
    private String nullToEmpty(String v) { 
        return v == null ? "" : v; 
    }
}


