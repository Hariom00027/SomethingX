package com.saarthix.service;

import com.saarthix.model.blueprint.Blueprint;
import com.saarthix.repository.blueprint.BlueprintRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    private final BlueprintRepository blueprintRepository;

    public AdminService(BlueprintRepository blueprintRepository) {
        this.blueprintRepository = blueprintRepository;
    }

    public List<Blueprint> getAllBlueprints() {
        return blueprintRepository.findAll();
    }

    public Blueprint getBlueprintById(String id) {
        Optional<Blueprint> blueprint = blueprintRepository.findById(id);
        return blueprint.orElse(null);
    }

    public Blueprint createBlueprint(Blueprint blueprint) {
        // Set creation metadata
        blueprint.setCreatedBy("admin"); // In a real app, this would be the authenticated admin user
        blueprint.setLastModifiedBy("admin");
        blueprint.setActive(true);
        
        return blueprintRepository.save(blueprint);
    }

    public Blueprint updateBlueprint(String id, Blueprint blueprint) {
        Optional<Blueprint> existingBlueprint = blueprintRepository.findById(id);
        if (existingBlueprint.isPresent()) {
            Blueprint existing = existingBlueprint.get();
            
            // Update fields
            existing.setName(blueprint.getName());
            existing.setType(blueprint.getType());
            existing.setDescription(blueprint.getDescription());
            existing.setCategory(blueprint.getCategory());
            existing.setSkillRequirements(blueprint.getSkillRequirements());
            existing.setActive(blueprint.isActive());
            existing.setLastModifiedBy("admin"); // In a real app, this would be the authenticated admin user
            
            return blueprintRepository.save(existing);
        }
        return null;
    }

    public boolean deleteBlueprint(String id) {
        if (blueprintRepository.existsById(id)) {
            blueprintRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Blueprint> getActiveBlueprints() {
        return blueprintRepository.findAll().stream()
                .filter(Blueprint::isActive)
                .toList();
    }

    public List<Blueprint> getBlueprintsByType(String type) {
        return blueprintRepository.findByType(type);
    }
}
