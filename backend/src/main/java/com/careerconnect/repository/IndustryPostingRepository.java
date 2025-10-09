package com.careerconnect.repository;

import com.careerconnect.model.IndustryPosting;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface IndustryPostingRepository extends MongoRepository<IndustryPosting, String> {
}
