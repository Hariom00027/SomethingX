package com.saarthix.repository;

import com.saarthix.model.Institute;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InstituteRepository extends MongoRepository<Institute, String> {
}
