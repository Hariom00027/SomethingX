package com.careerconnect.controller;

import com.careerconnect.model.ResumeTemplate;
import com.careerconnect.repository.ResumeTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/resume-templates")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ResumeTemplateController {
    private final ResumeTemplateRepository templateRepository;

    @GetMapping
    public List<ResumeTemplate> list() {
        return templateRepository.findAll();
    }
}


