package com.saarthix.controller;

import com.saarthix.model.IndustryTrainingRequest;
import com.saarthix.model.Training;
import com.saarthix.repository.IndustryTrainingRequestRepository;
import com.saarthix.repository.TrainingRepository;
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

    @PostMapping("/apply")
    public ResponseEntity<?> applyForTraining(@RequestBody IndustryTrainingRequest payload) {
        payload.setId(null);
        payload.setCreatedAt(Instant.now());

        if (payload.getTrainingId() != null && !payload.getTrainingId().isBlank()) {
            Optional<Training> trainingOpt = trainingRepository.findById(payload.getTrainingId());
            if (trainingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Training training = trainingOpt.get();
            payload.setTrainingRoleName(training.getRoleName());
            payload.setRequestType(payload.getRequestType() == null ? "EXISTING" : payload.getRequestType());
        } else {
            payload.setTrainingId(null);
            payload.setRequestType("CUSTOM");
            if (payload.getCustomRoleName() == null || payload.getCustomRoleName().isBlank()) {
                return ResponseEntity.badRequest().body("customRoleName is required for custom requests");
            }
        }

        IndustryTrainingRequest saved = requestRepository.save(payload);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/requests")
    public List<IndustryTrainingRequest> listRequests(@RequestParam(required = false) String trainingId,
                                                      @RequestParam(required = false) String contactEmail) {
        if (trainingId != null && !trainingId.isBlank()) {
            return requestRepository.findByTrainingId(trainingId);
        }
        if (contactEmail != null && !contactEmail.isBlank()) {
            return requestRepository.findByContactEmail(contactEmail);
        }
        return requestRepository.findAll();
    }
}
