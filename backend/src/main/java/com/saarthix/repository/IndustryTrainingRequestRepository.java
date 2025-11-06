package com.saarthix.repository;

import com.saarthix.model.IndustryTrainingRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IndustryTrainingRequestRepository extends MongoRepository<IndustryTrainingRequest, String> {
    List<IndustryTrainingRequest> findByTrainingId(String trainingId);
    List<IndustryTrainingRequest> findByContactEmail(String contactEmail);
}
