package com.saarthix.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.saarthix.model.ResumeTemplate;
import com.saarthix.model.SectionTemplate;
import com.saarthix.repository.ResumeTemplateRepository;
import com.saarthix.repository.SectionTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Service
public class TemplateInitializationService implements CommandLineRunner {

    @Autowired
    private ResumeTemplateRepository templateRepository;

    @Autowired
    private SectionTemplateRepository sectionTemplateRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        initializeTemplates();
        initializeSectionTemplates();
    }

    private void initializeTemplates() {
        try {
            // Delete old templates that don't match our new template structure
            List<ResumeTemplate> allTemplates = templateRepository.findAll();
            for (ResumeTemplate template : allTemplates) {
                // Delete templates that don't have the new structure (css, layoutType)
                if (template.getCss() == null || template.getLayoutType() == null) {
                    templateRepository.delete(template);
                    System.out.println("Deleted old template: " + template.getName());
                }
            }

            // Update existing templates with thumbnails if missing
            // Uses dynamic path generation based on template name (no hardcoding)
            List<ResumeTemplate> existingTemplates = templateRepository.findAll();
            boolean updated = false;
            for (ResumeTemplate template : existingTemplates) {
                if (template.getThumbnailUrl() == null || template.getThumbnailUrl().isEmpty()) {
                    String thumbnailUrl = generateThumbnailUrl(template.getName());
                    if (thumbnailUrl != null) {
                        template.setThumbnailUrl(thumbnailUrl);
                        templateRepository.save(template);
                        System.out.println("Updated thumbnail for: " + template.getName());
                        updated = true;
                    }
                }
            }

            if (updated) {
                System.out.println("Thumbnail update completed.");
            }

            // Try to load template data from JSON file (only if templates don't exist)
            if (templateRepository.count() == 0) {
                ClassPathResource resource = new ClassPathResource("template-data.json");
                if (!resource.exists()) {
                    System.out.println("template-data.json not found. Skipping template initialization.");
                    return;
                }

                InputStream inputStream = resource.getInputStream();
                List<Map<String, Object>> templateDataList = objectMapper.readValue(
                        inputStream,
                        new TypeReference<List<Map<String, Object>>>() {}
                );

                // Process each template from JSON
                for (Map<String, Object> templateData : templateDataList) {
                    String templateName = (String) templateData.get("name");
                    
                    // Find existing template or create new one
                    ResumeTemplate template = templateRepository.findAll().stream()
                            .filter(t -> templateName.equals(t.getName()))
                            .findFirst()
                            .orElse(null);

                    if (template == null) {
                        template = new ResumeTemplate();
                        System.out.println("Creating template: " + templateName);
                    } else {
                        System.out.println("Updating template: " + templateName);
                    }

                    // Set all fields from JSON data
                    template.setName(templateName);
                    template.setDescription((String) templateData.get("description"));
                    template.setCategory((String) templateData.get("category"));
                    template.setPreviewUrl((String) templateData.get("previewUrl"));
                    template.setPrimaryColor((String) templateData.get("primaryColor"));
                    template.setSecondaryColor((String) templateData.get("secondaryColor"));
                    template.setAccentColor((String) templateData.get("accentColor"));
                    
                    // Handle sections list
                    @SuppressWarnings("unchecked")
                    List<String> sections = (List<String>) templateData.get("sections");
                    template.setSections(sections);
                    
                    // Handle boolean fields
                    template.setActive(templateData.get("isActive") != null ? 
                        (Boolean) templateData.get("isActive") : true);
                    template.setHasProfileImage(templateData.get("hasProfileImage") != null ? 
                        (Boolean) templateData.get("hasProfileImage") : false);
                    
                    template.setLayoutType((String) templateData.get("layoutType"));
                    template.setCss((String) templateData.get("css"));
                    template.setThumbnailUrl((String) templateData.get("thumbnailUrl"));

                    templateRepository.save(template);
                }
            }
        
            System.out.println("Template initialization completed. Total templates: " + templateRepository.count());
        } catch (Exception e) {
            System.err.println("Error initializing templates: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Dynamically generates thumbnail URL based on template name.
     * Uses consistent naming pattern: /assets/templates/thumbnails/{Template Name}.png
     * This eliminates the need for hardcoded mappings.
     */
    private String generateThumbnailUrl(String templateName) {
        if (templateName == null || templateName.trim().isEmpty()) {
            return null;
        }
        // Generate path using template name directly
        // Format: /assets/templates/thumbnails/{Template Name}.png
        // Note: Browser will handle spaces in URLs, but we keep the name as-is to match file names
        return "/assets/templates/thumbnails/" + templateName + ".png";
    }

    private void initializeSectionTemplates() {
        try {
            // Load section templates from JSON file
            ClassPathResource resource = new ClassPathResource("add_section.json");
            if (!resource.exists()) {
                System.out.println("add_section.json not found. Skipping section template initialization.");
                return;
            }

            // Get all existing sections to check for duplicates
            List<SectionTemplate> existingSections = sectionTemplateRepository.findAll();
            long initialCount = existingSections.size();

            InputStream inputStream = resource.getInputStream();
            List<Map<String, Object>> sectionDataList = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<Map<String, Object>>>() {}
            );

            int addedCount = 0;
            int skippedCount = 0;

            // Process each section template from JSON
            for (Map<String, Object> sectionData : sectionDataList) {
                String title = (String) sectionData.get("title");
                
                // Check if section with this title already exists
                boolean exists = existingSections.stream()
                        .anyMatch(s -> title != null && title.equals(s.getTitle()));
                
                if (exists) {
                    System.out.println("Section template already exists, skipping: " + title);
                    skippedCount++;
                    continue;
                }

                // Create new section template
                SectionTemplate template = new SectionTemplate();
                template.setTitle(title);
                template.setContent((String) sectionData.get("content"));
                template.setContentType("text"); // Default to text type
                template.setIcon("📄"); // Default icon
                template.setColor("bg-gray-100 hover:bg-gray-200"); // Default color
                template.setActive(true);

                sectionTemplateRepository.save(template);
                System.out.println("Created section template: " + template.getTitle());
                addedCount++;
            }

            System.out.println("Section template initialization completed.");
            System.out.println("Initial sections: " + initialCount);
            System.out.println("Added: " + addedCount + ", Skipped: " + skippedCount);
            System.out.println("Total templates: " + sectionTemplateRepository.count());
        } catch (Exception e) {
            System.err.println("Error initializing section templates: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
