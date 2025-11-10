package com.saarthix.repository;

import com.saarthix.model.SectionTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SectionTemplateRepository extends MongoRepository<SectionTemplate, String> {
    List<SectionTemplate> findByIsActiveTrue();
}

