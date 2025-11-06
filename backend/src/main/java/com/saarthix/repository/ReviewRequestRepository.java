package com.saarthix.repository;

import com.saarthix.model.ReviewRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRequestRepository extends MongoRepository<ReviewRequest, String> {
    List<ReviewRequest> findByResumeId(String resumeId);
    List<ReviewRequest> findByStudentId(String studentId);
    List<ReviewRequest> findByTypeAndStatus(String type, String status);
    List<ReviewRequest> findByMentorId(String mentorId);
}


