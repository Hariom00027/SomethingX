package com.saarthix.controller;

import com.saarthix.model.IndustryTrainingRequest;
import com.saarthix.model.Training;
import com.saarthix.model.IndustryTrainingNotification;
import com.saarthix.repository.IndustryTrainingRequestRepository;
import com.saarthix.repository.TrainingRepository;
import com.saarthix.service.IndustryTrainingMailService;
import com.saarthix.service.IndustryTrainingNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/industry-training")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class IndustryTrainingController {

    @Autowired
    private TrainingRepository trainingRepository;

    @Autowired
    private IndustryTrainingRequestRepository requestRepository;

    @Autowired
    private IndustryTrainingNotificationService notificationService;

    @Autowired(required = false)
    private IndustryTrainingMailService mailService;

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody IndustryTrainingRequest payload) {
        payload.setId(null);
        payload.setCreatedAt(Instant.now());
        payload.setUpdatedAt(Instant.now());
        payload.setStatus("PENDING");
        payload.setAdminRespondedAt(null);
        payload.setAdminContactEmail(null);
        payload.setAdminContactName(null);
        payload.setAdminContactPhone(null);
        payload.setAdminMessage(null);
        payload.setAdminPricingDetails(null);
        payload.setAdminResourceLink(null);
        payload.setAdminSchedule(null);
        payload.setNotificationSent(Boolean.FALSE);
        payload.setNotificationSentAt(null);

        boolean hasTrainingId = payload.getTrainingId() != null && !payload.getTrainingId().isBlank();

        if (hasTrainingId) {
            Optional<Training> trainingOpt = trainingRepository.findById(payload.getTrainingId());
            if (trainingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Training training = trainingOpt.get();
            if (!training.isDayOneReady()) {
                return ResponseEntity.badRequest().body("Selected training is not certified day-one ready.");
            }

            payload.setTrainingRoleName(training.getRoleName());
            payload.setRequestType(payload.getRequestType() == null || payload.getRequestType().isBlank()
                    ? "EXISTING"
                    : payload.getRequestType());
            if (payload.getSpecificRole() == null || payload.getSpecificRole().isBlank()) {
                payload.setSpecificRole(training.getRoleName());
            }
            if (payload.getTargetIndustry() == null || payload.getTargetIndustry().isBlank()) {
                payload.setTargetIndustry(training.getIndustry());
            }
            if (payload.getPackageAfterSelection() == null || payload.getPackageAfterSelection().isBlank()) {
                payload.setPackageAfterSelection(training.getPackageAfterTraining());
            }
            if (payload.getStipendDetails() == null || payload.getStipendDetails().isBlank()) {
                payload.setStipendDetails(training.isStipendIncluded()
                        ? String.format("Stipend ₹%d", training.getStipendAmount())
                        : "No stipend");
            }
        } else {
            payload.setTrainingId(null);
            payload.setTrainingRoleName(null);
            payload.setRequestType("CUSTOM");
            if (payload.getCustomRoleName() == null || payload.getCustomRoleName().isBlank()) {
                return ResponseEntity.badRequest().body("customRoleName is required for custom requests");
            }
            if (payload.getSpecificRole() == null || payload.getSpecificRole().isBlank()) {
                payload.setSpecificRole(payload.getCustomRoleName());
            }
        }

        IndustryTrainingRequest saved = requestRepository.save(payload);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/requests")
    public List<IndustryTrainingRequest> listRequests(
            @RequestParam(required = false) String trainingId,
            @RequestParam(required = false) String contactEmail,
            @RequestParam(required = false) String status) {
        if (trainingId != null && !trainingId.isBlank()) {
            return requestRepository.findByTrainingId(trainingId);
        }
        if (contactEmail != null && !contactEmail.isBlank()) {
            return requestRepository.findByContactEmail(contactEmail);
        }
        if (status != null && !status.isBlank()) {
            return requestRepository.findByStatus(status.toUpperCase());
        }
        return requestRepository.findAll();
    }

    @PutMapping("/requests/{id}/admin-response")
    public ResponseEntity<?> respondToRequest(@PathVariable String id, @RequestBody AdminResponse payload) {
        Optional<IndustryTrainingRequest> requestOpt = requestRepository.findById(id);
        if (requestOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        IndustryTrainingRequest request = requestOpt.get();
        String normalizedStatus = payload.status() != null ? payload.status().toUpperCase() : "";
        if (!normalizedStatus.equals("APPROVED") && !normalizedStatus.equals("DECLINED")) {
            return ResponseEntity.badRequest().body("status must be APPROVED or DECLINED");
        }

        request.setStatus(normalizedStatus);
        request.setUpdatedAt(Instant.now());

        if (normalizedStatus.equals("APPROVED")) {
            if (payload.adminContactEmail() == null || payload.adminContactEmail().isBlank()
                    || payload.adminContactName() == null || payload.adminContactName().isBlank()
                    || payload.adminContactPhone() == null || payload.adminContactPhone().isBlank()
                    || payload.pricingDetails() == null || payload.pricingDetails().isBlank()
                    || payload.schedule() == null || payload.schedule().isBlank()) {
                return ResponseEntity.badRequest().body("pricingDetails, schedule, adminContactName, adminContactEmail, and adminContactPhone are required for approval");
            }
            request.setAdminPricingDetails(payload.pricingDetails());
            request.setAdminContactName(payload.adminContactName());
            request.setAdminContactEmail(payload.adminContactEmail());
            request.setAdminContactPhone(payload.adminContactPhone());
            request.setAdminMessage(payload.message());
            request.setAdminResourceLink(payload.resourceLink());
            request.setAdminSchedule(payload.schedule());
            request.setAdminRespondedAt(Instant.now());

            IndustryTrainingRequest saved = requestRepository.save(request);
            IndustryTrainingNotification notification = notificationService.createApprovalNotification(saved);
            saved.setNotificationSent(Boolean.TRUE);
            saved.setNotificationSentAt(notification.getCreatedAt());
            IndustryTrainingRequest updated = requestRepository.save(saved);
            if (mailService != null) {
                mailService.sendTrainingApprovalEmail(updated, notification);
            }
            return ResponseEntity.ok(updated);
        } else {
            request.setAdminPricingDetails(null);
            request.setAdminContactName(null);
            request.setAdminContactEmail(null);
            request.setAdminContactPhone(null);
            request.setAdminResourceLink(null);
            request.setAdminMessage(payload.message());
            request.setAdminSchedule(null);
            request.setAdminRespondedAt(Instant.now());
            request.setNotificationSent(Boolean.FALSE);
            request.setNotificationSentAt(null);
            return ResponseEntity.ok(requestRepository.save(request));
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<IndustryTrainingNotification>> notificationsForContact(
            @RequestParam String contactEmail) {
        if (contactEmail == null || contactEmail.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(notificationService.notificationsForContact(contactEmail));
    }

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<IndustryTrainingNotification> markNotificationAsRead(@PathVariable String id) {
        Optional<IndustryTrainingNotification> notificationOpt = notificationService.markAsRead(id);
        return notificationOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record AdminResponse(
            String status,
            String pricingDetails,
            String adminContactName,
            String adminContactEmail,
            String adminContactPhone,
            String message,
            String resourceLink,
            String schedule
    ) {
    }
}

