package com.saarthix.controller;

import com.saarthix.model.Resume;
import com.saarthix.repository.ResumeRepository;
import com.saarthix.repository.ResumeTemplateRepository;
import com.saarthix.service.OpenAIService;
import com.saarthix.service.PdfRenderService;
import com.saarthix.service.ResumeParsingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/resumes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeRepository resumeRepository;
    private final ResumeTemplateRepository templateRepository;
    private final PdfRenderService pdfRenderService;
    private final ResumeParsingService resumeParsingService;
    private final OpenAIService openAIService;

    @PostMapping
    public Resume createResume(@RequestBody Resume resume) {
        return resumeRepository.save(resume);
    }

    @PutMapping("/{id}")
    public Resume updateResume(@PathVariable String id, @RequestBody Resume resume) {
        resume.setId(id);
        return resumeRepository.save(resume);
    }

    @GetMapping
    public List<Resume> getAllResumes() {
        return resumeRepository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Resume> getByStudent(@PathVariable String studentId) {
        return resumeRepository.findByStudentId(studentId);
    }

    @GetMapping("/mentor-review-requests")
    public List<Resume> getMentorReviewRequests() {
        return resumeRepository.findByMentorReviewRequestedTrue();
    }

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public byte[] downloadPdf(@PathVariable String id) {
        var resume = resumeRepository.findById(id).orElse(null);
        if (resume == null) return new byte[0];
        var template = templateRepository.findById(resume.getTemplateId()).orElse(null);
        if (template == null) return new byte[0];
        return pdfRenderService.render(resume, template);
    }

    @GetMapping(value = "/{id}/html", produces = MediaType.TEXT_HTML_VALUE)
    public String previewHtml(@PathVariable String id) {
        var resume = resumeRepository.findById(id).orElse(null);
        if (resume == null) return "<html><body><h1>Resume not found</h1></body></html>";
        var template = templateRepository.findById(resume.getTemplateId()).orElse(null);
        if (template == null) return "<html><body><h1>Template not found</h1></body></html>";
        return pdfRenderService.generateHtmlContent(resume, template);
    }

    @PostMapping(value = "/parse", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> parseResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("templateId") String templateId,
            @RequestParam("studentId") String studentId) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "File is empty or null"));
            }

            System.out.println("Parsing resume - File: " + file.getOriginalFilename() + ", Size: " + file.getSize());
            System.out.println("TemplateId: " + templateId + ", StudentId: " + studentId);

            Resume parsedResume = resumeParsingService.parseResume(file, templateId, studentId);
            
            System.out.println("Parsed resume successfully. PersonalInfo: " + (parsedResume.getPersonalInfo() != null ? "present" : "null"));
            System.out.println("Experience count: " + (parsedResume.getExperience() != null ? parsedResume.getExperience().size() : 0));
            System.out.println("Education count: " + (parsedResume.getEducation() != null ? parsedResume.getEducation().size() : 0));
            
            return ResponseEntity.ok(parsedResume);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error parsing resume: " + e.getMessage());
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", "Failed to parse resume",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    @PostMapping("/{id}/suggest-section")
    public ResponseEntity<?> suggestSectionContent(
            @PathVariable String id,
            @RequestBody java.util.Map<String, String> request) {
        try {
            Resume resume = resumeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Resume not found"));
            
            String sectionName = request.get("sectionName");
            String currentContent = request.get("currentContent");
            String userQuestion = request.get("userQuestion");
            
            if (sectionName == null || sectionName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Section name is required"));
            }
            
            String suggestion = openAIService.suggestSectionContent(resume, sectionName, currentContent, userQuestion);
            
            return ResponseEntity.ok(java.util.Map.of("suggestion", suggestion));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", "Failed to generate suggestion",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }
}
