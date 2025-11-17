package com.saarthix.repository;

import com.saarthix.model.IndustryExpertSessionEnrollment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IndustryExpertSessionEnrollmentRepository extends MongoRepository<IndustryExpertSessionEnrollment, String> {

    List<IndustryExpertSessionEnrollment> findTop10ByOrderBySubmittedAtDesc();
}

