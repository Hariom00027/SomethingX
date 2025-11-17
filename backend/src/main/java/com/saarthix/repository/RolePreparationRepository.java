package com.saarthix.repository;

import com.saarthix.model.RolePreparation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RolePreparationRepository extends MongoRepository<RolePreparation, String> {
    Optional<RolePreparation> findByStudentIdAndRoleName(String studentId, String roleName);
    List<RolePreparation> findByStudentId(String studentId);
    List<RolePreparation> findByStudentIdAndIsActive(String studentId, boolean isActive);
    boolean existsByStudentIdAndRoleName(String studentId, String roleName);
}

