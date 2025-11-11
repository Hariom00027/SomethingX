package com.saarthix.controller;

import com.saarthix.model.SectionTemplate;
import com.saarthix.repository.SectionTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/section-templates")
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

    @GetMapping("/{id}")
    public ResponseEntity<SectionTemplate> getTemplateById(@PathVariable String id) {
        return sectionTemplateRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SectionTemplate> createTemplate(@RequestBody SectionTemplate template) {
        try {
            SectionTemplate created = sectionTemplateRepository.save(template);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<SectionTemplate> updateTemplate(@PathVariable String id, @RequestBody SectionTemplate template) {
        return sectionTemplateRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(template.getTitle());
                    existing.setContentType(template.getContentType());
                    existing.setContent(template.getContent());
                    existing.setItems(template.getItems());
                    existing.setIcon(template.getIcon());
                    existing.setColor(template.getColor());
                    existing.setActive(template.isActive());
                    return ResponseEntity.ok(sectionTemplateRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        if (sectionTemplateRepository.existsById(id)) {
            sectionTemplateRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

