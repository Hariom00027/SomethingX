package com.careerconnect.controller;

import com.careerconnect.model.blueprint.Blueprint;
import com.careerconnect.service.AdminService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/blueprints")
    public List<Blueprint> getAllBlueprints() {
        return adminService.getAllBlueprints();
    }

    @GetMapping("/blueprints/{id}")
    public ResponseEntity<Blueprint> getBlueprintById(@PathVariable String id) {
        Blueprint blueprint = adminService.getBlueprintById(id);
        if (blueprint != null) {
            return ResponseEntity.ok(blueprint);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/blueprints")
    public ResponseEntity<Blueprint> createBlueprint(@RequestBody Blueprint blueprint) {
        try {
            Blueprint createdBlueprint = adminService.createBlueprint(blueprint);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBlueprint);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/blueprints/{id}")
    public ResponseEntity<Blueprint> updateBlueprint(@PathVariable String id, @RequestBody Blueprint blueprint) {
        try {
            Blueprint updatedBlueprint = adminService.updateBlueprint(id, blueprint);
            if (updatedBlueprint != null) {
                return ResponseEntity.ok(updatedBlueprint);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/blueprints/{id}")
    public ResponseEntity<Void> deleteBlueprint(@PathVariable String id) {
        boolean deleted = adminService.deleteBlueprint(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/blueprints/active")
    public List<Blueprint> getActiveBlueprints() {
        return adminService.getActiveBlueprints();
    }

    @GetMapping("/blueprints/type/{type}")
    public List<Blueprint> getBlueprintsByType(@PathVariable String type) {
        return adminService.getBlueprintsByType(type);
    }
}
