package com.careerconnect.repository;

import com.careerconnect.model.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResumeRepository extends MongoRepository<Resume, String> {
    List<Resume> findByStudentId(String studentId);
}
