package com.careerconnect.repository;

import com.careerconnect.model.Training;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TrainingRepository extends MongoRepository<Training, String> {
}


