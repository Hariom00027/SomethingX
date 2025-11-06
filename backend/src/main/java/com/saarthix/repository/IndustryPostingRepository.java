package com.saarthix.repository;

import com.saarthix.model.IndustryPosting;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface IndustryPostingRepository extends MongoRepository<IndustryPosting, String> {
}
