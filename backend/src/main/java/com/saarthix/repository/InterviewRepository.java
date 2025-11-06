package com.saarthix.repository;

import com.saarthix.model.Interview;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InterviewRepository extends MongoRepository<Interview, String> {
}
