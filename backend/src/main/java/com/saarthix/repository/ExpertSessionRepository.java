package com.saarthix.repository;

import com.saarthix.model.ExpertSession;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ExpertSessionRepository extends MongoRepository<ExpertSession, String> {
}


