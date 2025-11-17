package com.saarthix.repository;

import com.saarthix.model.InstituteExpertSessionEnrollment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface InstituteExpertSessionEnrollmentRepository extends MongoRepository<InstituteExpertSessionEnrollment, String> {

    List<InstituteExpertSessionEnrollment> findTop10ByOrderBySubmittedAtDesc();
    long countByExpertSessionId(String expertSessionId);
    List<InstituteExpertSessionEnrollment> findTop5ByExpertSessionIdOrderBySubmittedAtDesc(String expertSessionId);
}


