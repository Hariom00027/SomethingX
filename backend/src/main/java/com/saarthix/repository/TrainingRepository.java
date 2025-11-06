package com.saarthix.repository;

import com.saarthix.model.Training;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TrainingRepository extends MongoRepository<Training, String> {
}


