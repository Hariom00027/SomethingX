package com.careerconnect.controller;

import com.careerconnect.model.Resume;
import com.careerconnect.repository.ResumeRepository;
import com.careerconnect.repository.ResumeTemplateRepository;
import com.careerconnect.service.PdfRenderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resumes")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeRepository resumeRepository;
    private final ResumeTemplateRepository templateRepository;
    private final PdfRenderService pdfRenderService;

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
}
