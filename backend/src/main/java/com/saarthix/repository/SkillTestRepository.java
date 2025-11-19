package com.saarthix.repository;

import com.saarthix.model.SkillTest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillTestRepository extends MongoRepository<SkillTest, String> {
    Optional<SkillTest> findByStudentIdAndRoleNameAndSkillNameAndStatus(
            String studentId, String roleName, String skillName, String status);
    List<SkillTest> findByStudentIdAndRoleNameAndSkillName(
            String studentId, String roleName, String skillName);
    Optional<SkillTest> findFirstByStudentIdAndRoleNameAndSkillNameOrderByStartedAtDesc(
            String studentId, String roleName, String skillName);
}

