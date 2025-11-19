package com.saarthix.controller;

import com.saarthix.model.SkillTest;
import com.saarthix.service.SkillTestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/skill-test")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class SkillTestController {

    private final SkillTestService skillTestService;

    public SkillTestController(SkillTestService skillTestService) {
        this.skillTestService = skillTestService;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startTest(
            @RequestParam String studentId,
            @RequestParam String roleName,
            @RequestParam String skillName) {
        try {
            String decodedRoleName = java.net.URLDecoder.decode(roleName, "UTF-8");
            String decodedSkillName = java.net.URLDecoder.decode(skillName, "UTF-8");
            
            SkillTest test = skillTestService.startTest(studentId, decodedRoleName, decodedSkillName);
            return ResponseEntity.ok(test);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error starting test: " + e.getMessage());
        }
    }

    @GetMapping("/{testId}")
    public ResponseEntity<?> getTest(@PathVariable String testId) {
        try {
            SkillTest test = skillTestService.getTest(testId);
            return ResponseEntity.ok(test);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error fetching test: " + e.getMessage());
        }
    }

    @GetMapping("/in-progress")
    public ResponseEntity<?> getInProgressTest(
            @RequestParam String studentId,
            @RequestParam String roleName,
            @RequestParam String skillName) {
        try {
            String decodedRoleName = java.net.URLDecoder.decode(roleName, "UTF-8");
            String decodedSkillName = java.net.URLDecoder.decode(skillName, "UTF-8");
            
            SkillTest test = skillTestService.getInProgressTest(studentId, decodedRoleName, decodedSkillName);
            return ResponseEntity.ok(test);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{testId}/answer")
    public ResponseEntity<?> submitAnswer(
            @PathVariable String testId,
            @RequestBody Map<String, Object> request) {
        try {
            Integer questionNumber = (Integer) request.get("questionNumber");
            String answer = (String) request.get("answer");
            
            SkillTest test = skillTestService.submitAnswer(testId, questionNumber, answer);
            return ResponseEntity.ok(test);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error submitting answer: " + e.getMessage());
        }
    }

    @PostMapping("/{testId}/submit")
    public ResponseEntity<?> submitTest(@PathVariable String testId) {
        try {
            SkillTest test = skillTestService.submitTest(testId);
            return ResponseEntity.ok(test);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error submitting test: " + e.getMessage());
        }
    }

    @GetMapping("/result")
    public ResponseEntity<?> getLatestResult(
            @RequestParam String studentId,
            @RequestParam String roleName,
            @RequestParam String skillName) {
        try {
            String decodedRoleName = java.net.URLDecoder.decode(roleName, "UTF-8");
            String decodedSkillName = java.net.URLDecoder.decode(skillName, "UTF-8");
            
            SkillTest test = skillTestService.getLatestTestResult(studentId, decodedRoleName, decodedSkillName);
            if (test == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(test);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error fetching result: " + e.getMessage());
        }
    }
}

