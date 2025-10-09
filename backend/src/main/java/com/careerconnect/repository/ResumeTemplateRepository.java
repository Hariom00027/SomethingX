package com.careerconnect.repository;

import com.careerconnect.model.ResumeTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResumeTemplateRepository extends MongoRepository<ResumeTemplate, String> {
}


