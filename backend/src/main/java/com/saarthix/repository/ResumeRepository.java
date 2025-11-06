package com.saarthix.repository;

import com.saarthix.model.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResumeRepository extends MongoRepository<Resume, String> {
    List<Resume> findByStudentId(String studentId);
    List<Resume> findByMentorReviewRequestedTrue();
}
