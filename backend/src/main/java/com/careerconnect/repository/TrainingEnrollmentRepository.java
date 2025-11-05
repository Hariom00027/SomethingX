package com.careerconnect.repository;

import com.careerconnect.model.TrainingEnrollment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TrainingEnrollmentRepository extends MongoRepository<TrainingEnrollment, String> {
    List<TrainingEnrollment> findByTrainingId(String trainingId);
    List<TrainingEnrollment> findByEmail(String email);
}


