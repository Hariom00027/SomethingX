package com.saarthix.repository;

import com.saarthix.model.ExpertSessionEnrollment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ExpertSessionEnrollmentRepository extends MongoRepository<ExpertSessionEnrollment, String> {

    List<ExpertSessionEnrollment> findTop10ByOrderBySubmittedAtDesc();
}


