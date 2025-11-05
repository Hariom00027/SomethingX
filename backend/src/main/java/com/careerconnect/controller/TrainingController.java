package com.careerconnect.controller;

import com.careerconnect.model.Training;
import com.careerconnect.model.TrainingEnrollment;
import com.careerconnect.repository.TrainingEnrollmentRepository;
import com.careerconnect.repository.TrainingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/trainings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TrainingController {

    @Autowired
    private TrainingRepository trainingRepository;

    @Autowired
    private TrainingEnrollmentRepository enrollmentRepository;

    @GetMapping
    public List<Training> getAllTrainings() {
        return trainingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Training> getTrainingById(@PathVariable String id) {
        Optional<Training> training = trainingRepository.findById(id);
        return training.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<TrainingEnrollment> enroll(@PathVariable String id, @RequestBody TrainingEnrollment payload) {
        Optional<Training> trainingOpt = trainingRepository.findById(id);
        if (trainingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Training training = trainingOpt.get();
        payload.setId(null);
        payload.setTrainingId(training.getId());
        payload.setTrainingRoleName(training.getRoleName());

        TrainingEnrollment saved = enrollmentRepository.save(payload);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/enrollments")
    public List<TrainingEnrollment> listEnrollments(@RequestParam(required = false) String trainingId,
                                                    @RequestParam(required = false) String email) {
        if (trainingId != null && !trainingId.isEmpty()) {
            return enrollmentRepository.findByTrainingId(trainingId);
        }
        if (email != null && !email.isEmpty()) {
            return enrollmentRepository.findByEmail(email);
        }
        return enrollmentRepository.findAll();
    }

    @PostMapping("/seed")
    public ResponseEntity<Map<String, Object>> seed(@RequestBody List<Training> trainings) {
        long before = trainingRepository.count();
        trainingRepository.saveAll(trainings);
        long after = trainingRepository.count();
        return ResponseEntity.ok(Map.of("inserted", (after - before), "total", after));
    }
}


