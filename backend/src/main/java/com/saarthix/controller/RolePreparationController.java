package com.saarthix.controller;

import com.saarthix.model.RolePreparation;
import com.saarthix.service.RolePreparationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/role-preparation")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class RolePreparationController {

    private final RolePreparationService rolePreparationService;

    public RolePreparationController(RolePreparationService rolePreparationService) {
        this.rolePreparationService = rolePreparationService;
    }

    @PostMapping("/start/{roleName}")
    public ResponseEntity<?> startPreparation(
            @PathVariable String roleName,
            @RequestParam String studentId) {
        try {
            // URL decode the role name (handle already decoded names)
            String decodedRoleName;
            try {
                decodedRoleName = java.net.URLDecoder.decode(roleName, "UTF-8");
            } catch (Exception decodeEx) {
                decodedRoleName = roleName; // Use as-is if decoding fails
            }
            
            System.out.println("Starting preparation for role: " + decodedRoleName + ", student: " + studentId);
            RolePreparation preparation = rolePreparationService.startPreparation(studentId, decodedRoleName);
            System.out.println("Preparation created/retrieved: " + (preparation != null ? preparation.getId() : "null"));
            return ResponseEntity.ok(preparation);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error in startPreparation: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error starting preparation: " + e.getMessage());
        }
    }

    @PutMapping("/skill/{roleName}/{skillName}")
    public ResponseEntity<?> updateSkillCompletion(
            @PathVariable String roleName,
            @PathVariable String skillName,
            @RequestParam String studentId,
            @RequestParam boolean completed) {
        try {
            // URL decode the role name and skill name
            String decodedRoleName = java.net.URLDecoder.decode(roleName, "UTF-8");
            String decodedSkillName = java.net.URLDecoder.decode(skillName, "UTF-8");
            RolePreparation preparation = rolePreparationService.updateSkillCompletion(
                    studentId, decodedRoleName, decodedSkillName, completed);
            return ResponseEntity.ok(preparation);
        } catch (RuntimeException e) {
            e.printStackTrace();
            // Return a structured error response
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("code", "SKILL_COMPLETION_REQUIRES_TEST");
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error updating skill: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{roleName}")
    public ResponseEntity<RolePreparation> getPreparation(
            @PathVariable String roleName,
            @RequestParam String studentId) {
        try {
            // URL decode the role name
            String decodedRoleName = java.net.URLDecoder.decode(roleName, "UTF-8");
            RolePreparation preparation = rolePreparationService.getPreparation(studentId, decodedRoleName);
            if (preparation != null) {
                return ResponseEntity.ok(preparation);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<RolePreparation>> getAllPreparations(@RequestParam String studentId) {
        List<RolePreparation> preparations = rolePreparationService.getAllPreparations(studentId);
        return ResponseEntity.ok(preparations);
    }

    @GetMapping("/analytics/{roleName}")
    public ResponseEntity<?> getAnalytics(
            @PathVariable String roleName,
            @RequestParam String studentId) {
        try {
            // URL decode the role name
            String decodedRoleName = java.net.URLDecoder.decode(roleName, "UTF-8");
            Map<String, Object> analytics = rolePreparationService.getAnalytics(studentId, decodedRoleName);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error fetching analytics: " + e.getMessage());
        }
    }

    @DeleteMapping("/{roleName}")
    public ResponseEntity<?> deletePreparation(
            @PathVariable String roleName,
            @RequestParam String studentId) {
        try {
            // URL decode the role name
            String decodedRoleName = java.net.URLDecoder.decode(roleName, "UTF-8");
            rolePreparationService.deletePreparation(studentId, decodedRoleName);
            return ResponseEntity.ok().body("Preparation deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error deleting preparation: " + e.getMessage());
        }
    }
}

