package com.careerconnect.repository;

import com.careerconnect.model.ReviewRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRequestRepository extends MongoRepository<ReviewRequest, String> {
    List<ReviewRequest> findByResumeId(String resumeId);
}


