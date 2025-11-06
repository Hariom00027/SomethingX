package com.saarthix.repository;

import com.saarthix.model.ResumeTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResumeTemplateRepository extends MongoRepository<ResumeTemplate, String> {
}


