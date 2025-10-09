package com.careerconnect.repository;

import com.careerconnect.model.Institute;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InstituteRepository extends MongoRepository<Institute, String> {
}
