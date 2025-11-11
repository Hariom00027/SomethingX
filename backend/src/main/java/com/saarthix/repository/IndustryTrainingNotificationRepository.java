package com.saarthix.repository;

import com.saarthix.model.IndustryTrainingNotification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IndustryTrainingNotificationRepository extends MongoRepository<IndustryTrainingNotification, String> {
    List<IndustryTrainingNotification> findByContactEmailOrderByCreatedAtDesc(String contactEmail);
}


