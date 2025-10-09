package com.careerconnect.repository;

import com.careerconnect.model.Interview;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InterviewRepository extends MongoRepository<Interview, String> {
}
