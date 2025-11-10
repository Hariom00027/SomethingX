package com.saarthix.controller;

import com.saarthix.model.SectionTemplate;
import com.saarthix.repository.SectionTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/section-templates")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class SectionTemplateController {

    private final SectionTemplateRepository sectionTemplateRepository;

    @GetMapping
    public List<SectionTemplate> getAllActiveTemplates() {
        return sectionTemplateRepository.findByIsActiveTrue();
    }

    @GetMapping("/all")
    public List<SectionTemplate> getAllTemplates() {
        return sectionTemplateRepository.findAll();
    }
}

