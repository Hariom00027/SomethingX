package com.saarthix.controller;

import com.saarthix.model.ExpertSession;
import com.saarthix.model.ExpertSessionEnrollment;
import com.saarthix.model.InstituteExpertSessionEnrollment;
import com.saarthix.model.IndustryExpertSessionEnrollment;
import com.saarthix.repository.ExpertSessionEnrollmentRepository;
import com.saarthix.repository.InstituteExpertSessionEnrollmentRepository;
import com.saarthix.repository.IndustryExpertSessionEnrollmentRepository;
import com.saarthix.repository.ExpertSessionRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expert-sessions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class ExpertSessionController {

    private final ExpertSessionRepository expertSessionRepository;
    private final ExpertSessionEnrollmentRepository enrollmentRepository;
    private final InstituteExpertSessionEnrollmentRepository instituteEnrollmentRepository;
    private final IndustryExpertSessionEnrollmentRepository industryEnrollmentRepository;

    @GetMapping
    public List<ExpertSession> getExpertSessions() {
        return expertSessionRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpertSession> getExpertSession(@PathVariable String id) {
        return expertSessionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/enrollments/latest")
    public List<ExpertSessionEnrollment> getLatestEnrollments() {
        return enrollmentRepository.findTop10ByOrderBySubmittedAtDesc();
    }

    // Institute-specific endpoints
    @GetMapping("/institutes/enrollments/latest")
    public List<InstituteExpertSessionEnrollment> getLatestInstituteEnrollments() {
        return instituteEnrollmentRepository.findTop10ByOrderBySubmittedAtDesc();
    }

    @PostMapping("/institutes/{id}/enroll")
    public ResponseEntity<?> enrollInstitute(@PathVariable String id, @RequestBody EnrollRequest request) {
        var expertSession = expertSessionRepository.findById(id).orElse(null);
        if (expertSession == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Expert session not found"));
        }

        var validationError = validateRequest(request);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }

        var enrollment = new InstituteExpertSessionEnrollment();
        enrollment.setExpertSessionId(expertSession.getId());
        enrollment.setExpertNameSnapshot(expertSession.getFullName());
        enrollment.setInstituteName(request.getInstituteName());
        enrollment.setPlace(request.getPlace());
        enrollment.setContactNumber(request.getContactNumber());
        enrollment.setEmail(request.getEmail());
        enrollment.setContactPersonName(request.getContactPersonName());
        enrollment.setContactPersonDesignation(request.getContactPersonDesignation());
        enrollment.setPreferredMode(request.getPreferredMode());
        enrollment.setPreferredDate(request.getPreferredDate());
        enrollment.setPreferredTime(request.getPreferredTime());
        enrollment.setExpectedParticipantCount(request.getExpectedParticipantCount());
        enrollment.setAdditionalNotes(request.getAdditionalNotes());

        var saved = instituteEnrollmentRepository.save(enrollment);
        return ResponseEntity.ok(saved);
    }

    // Industry-specific endpoints
    @GetMapping("/industry/enrollments/latest")
    public List<IndustryExpertSessionEnrollment> getLatestIndustryEnrollments() {
        return industryEnrollmentRepository.findTop10ByOrderBySubmittedAtDesc();
    }

    @PostMapping("/industry/{id}/enroll")
    public ResponseEntity<?> enrollIndustry(@PathVariable String id, @RequestBody EnrollRequest request) {
        var expertSession = expertSessionRepository.findById(id).orElse(null);
        if (expertSession == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Expert session not found"));
        }

        var validationError = validateRequest(request);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }

        var enrollment = new IndustryExpertSessionEnrollment();
        enrollment.setExpertSessionId(expertSession.getId());
        enrollment.setExpertNameSnapshot(expertSession.getFullName());
        enrollment.setInstituteName(request.getInstituteName());
        enrollment.setPlace(request.getPlace());
        enrollment.setContactNumber(request.getContactNumber());
        enrollment.setEmail(request.getEmail());
        enrollment.setContactPersonName(request.getContactPersonName());
        enrollment.setContactPersonDesignation(request.getContactPersonDesignation());
        enrollment.setPreferredMode(request.getPreferredMode());
        enrollment.setPreferredDate(request.getPreferredDate());
        enrollment.setPreferredTime(request.getPreferredTime());
        enrollment.setExpectedParticipantCount(request.getExpectedParticipantCount());
        enrollment.setAdditionalNotes(request.getAdditionalNotes());

        var saved = industryEnrollmentRepository.save(enrollment);
        return ResponseEntity.ok(saved);
    }

    // Legacy endpoint for backward compatibility
    @PostMapping("/{id}/enroll")
    public ResponseEntity<?> enroll(@PathVariable String id, @RequestBody EnrollRequest request) {
        var expertSession = expertSessionRepository.findById(id).orElse(null);
        if (expertSession == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Expert session not found"));
        }

        var validationError = validateRequest(request);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }

        var enrollment = new ExpertSessionEnrollment();
        enrollment.setExpertSessionId(expertSession.getId());
        enrollment.setExpertNameSnapshot(expertSession.getFullName());
        enrollment.setInstituteName(request.getInstituteName());
        enrollment.setPlace(request.getPlace());
        enrollment.setContactNumber(request.getContactNumber());
        enrollment.setEmail(request.getEmail());
        enrollment.setContactPersonName(request.getContactPersonName());
        enrollment.setContactPersonDesignation(request.getContactPersonDesignation());
        enrollment.setPreferredMode(request.getPreferredMode());
        enrollment.setPreferredDate(request.getPreferredDate());
        enrollment.setPreferredTime(request.getPreferredTime());
        enrollment.setExpectedParticipantCount(request.getExpectedParticipantCount());
        enrollment.setAdditionalNotes(request.getAdditionalNotes());

        var saved = enrollmentRepository.save(enrollment);
        return ResponseEntity.ok(saved);
    }

    private String validateRequest(EnrollRequest request) {
        if (!StringUtils.hasText(request.getInstituteName())) {
            return "Institute name is required";
        }
        if (!StringUtils.hasText(request.getPlace())) {
            return "Place is required";
        }
        if (!StringUtils.hasText(request.getContactNumber())) {
            return "Contact number is required";
        }
        if (!StringUtils.hasText(request.getEmail())) {
            return "Email is required";
        }
        if (!StringUtils.hasText(request.getContactPersonName())) {
            return "Contact person name is required";
        }
        if (!StringUtils.hasText(request.getPreferredMode())) {
            return "Preferred mode is required";
        }
        if (!StringUtils.hasText(request.getPreferredDate())) {
            return "Preferred date is required";
        }
        if (!StringUtils.hasText(request.getPreferredTime())) {
            return "Preferred time is required";
        }
        return null;
    }

    @Data
    private static class EnrollRequest {
        private String instituteName;
        private String place;
        private String contactNumber;
        private String email;
        private String contactPersonName;
        private String contactPersonDesignation;
        private String preferredMode;
        private String preferredDate;
        private String preferredTime;
        private Integer expectedParticipantCount;
        private String additionalNotes;
    }
}


