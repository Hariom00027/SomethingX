package com.saarthix.repository.blueprint;

import com.saarthix.model.blueprint.Blueprint;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface BlueprintRepository extends MongoRepository<Blueprint, String> {

    List<Blueprint> findByType(String type);

    Optional<Blueprint> findByNameAndType(String name, String type);
}


