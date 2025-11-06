package com.saarthix.repository;

import com.saarthix.model.TrainingEnrollment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TrainingEnrollmentRepository extends MongoRepository<TrainingEnrollment, String> {
    List<TrainingEnrollment> findByTrainingId(String trainingId);
    List<TrainingEnrollment> findByEmail(String email);
}


