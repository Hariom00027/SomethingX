package com.saarthix.controller.blueprint;
//abc
import com.saarthix.model.blueprint.Blueprint;
import com.saarthix.service.blueprint.BlueprintService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blueprint")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class BlueprintController {

    private final BlueprintService blueprintService;

    public BlueprintController(BlueprintService blueprintService) {
        this.blueprintService = blueprintService;
    }

    @GetMapping("/all")
    public List<Blueprint> getAllBlueprints() {
        return blueprintService.getAllBlueprints();
    }

    @GetMapping("/industries")
    public List<String> getIndustries() {
        return blueprintService.getIndustries();
    }

    @GetMapping("/educations")
    public List<String> getEducations() {
        return blueprintService.getEducations();
    }

    @GetMapping("/specializations")
    public List<String> getSpecializations() {
        return blueprintService.getSpecializations();
    }

    @GetMapping("/industry/{industryName}/roles")
    public List<String> getRolesByIndustry(@PathVariable String industryName) {
        return blueprintService.getRolesByIndustry(industryName);
    }

    @GetMapping("/industry/{industryName}/education")
    public List<String> getEducationByIndustry(@PathVariable String industryName) {
        return blueprintService.getEducationByIndustry(industryName);
    }

    @GetMapping("/education/{educationName}/specializations")
    public List<String> getSpecializationsByEducation(@PathVariable String educationName) {
        return blueprintService.getSpecializationsByEducation(educationName);
    }

    @GetMapping("/specialization/{specializationName}/roles")
    public List<String> getRolesBySpecialization(@PathVariable String specializationName) {
        return blueprintService.getRolesBySpecialization(specializationName);
    }

    @GetMapping("/roles")
    public List<String> getAllRoles() {
        return blueprintService.getAllRoles();
    }

    @GetMapping("/role/{roleName}")
    public Blueprint getRoleDetails(@PathVariable String roleName) {
        return blueprintService.getRoleDetails(roleName);
    }

    @GetMapping("/role/{roleName}/gantt")
    public Blueprint getRoleDetailsWithGanttChart(@PathVariable String roleName, @RequestParam String userId, @RequestParam(required = false) Integer duration) {
        return blueprintService.getRoleDetailsWithGanttChart(roleName, userId, duration);
    }

    @PostMapping("/role/{roleName}/map-industry")
    public ResponseEntity<String> mapRoleToIndustry(@PathVariable String roleName, @RequestParam String industryName) {
        boolean success = blueprintService.mapRoleToIndustry(roleName, industryName);
        if (success) {
            return ResponseEntity.ok("Role mapped to industry successfully");
        }
        return ResponseEntity.badRequest().body("Failed to map role to industry");
    }

    @PostMapping("/role/{roleName}/map-education")
    public ResponseEntity<String> mapRoleToEducation(@PathVariable String roleName, @RequestParam String educationName) {
        boolean success = blueprintService.mapRoleToEducation(roleName, educationName);
        if (success) {
            return ResponseEntity.ok("Role mapped to education successfully");
        }
        return ResponseEntity.badRequest().body("Failed to map role to education");
    }

    @PostMapping("/industry/{industryName}/map-education")
    public ResponseEntity<String> mapIndustryToEducation(@PathVariable String industryName, @RequestParam String educationName) {
        boolean success = blueprintService.mapIndustryToEducation(industryName, educationName);
        if (success) {
            return ResponseEntity.ok("Industry mapped to education successfully");
        }
        return ResponseEntity.badRequest().body("Failed to map industry to education");
    }

    @PostMapping("/specialization/{specializationName}/map-education")
    public ResponseEntity<String> mapSpecializationToEducation(@PathVariable String specializationName, @RequestParam String educationName) {
        boolean success = blueprintService.mapSpecializationToEducation(specializationName, educationName);
        if (success) {
            return ResponseEntity.ok("Specialization mapped to education successfully");
        }
        return ResponseEntity.badRequest().body("Failed to map specialization to education");
    }

    @PostMapping("/role/{roleName}/map-specialization")
    public ResponseEntity<String> mapRoleToSpecialization(@PathVariable String roleName, @RequestParam String specializationName) {
        boolean success = blueprintService.mapRoleToSpecialization(roleName, specializationName);
        if (success) {
            return ResponseEntity.ok("Role mapped to specialization successfully");
        }
        return ResponseEntity.badRequest().body("Failed to map role to specialization");
    }

    @GetMapping("/role/{roleName}/mappings")
    public ResponseEntity<Map<String, Object>> getRoleMappings(@PathVariable String roleName) {
        Map<String, Object> mappings = blueprintService.getRoleMappings(roleName);
        return ResponseEntity.ok(mappings);
    }

    @GetMapping("/role/{roleName}/skill/{skillName}/topics")
    public ResponseEntity<Map<Integer, List<String>>> getSkillTopics(
            @PathVariable String roleName,
            @PathVariable String skillName,
            @RequestParam int totalMonths,
            @RequestParam int startMonth,
            @RequestParam int endMonth) {
        try {
            Map<Integer, List<String>> topics = blueprintService.getSkillTopics(
                    roleName, skillName, totalMonths, startMonth, endMonth);
            return ResponseEntity.ok(topics);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/skills")
    public ResponseEntity<List<String>> getAllSkillNames(@RequestParam(required = false) String query) {
        try {
            List<String> skills;
            if (query != null && !query.trim().isEmpty()) {
                skills = blueprintService.searchSkillNames(query);
            } else {
                skills = blueprintService.getAllSkillNames();
            }
            return ResponseEntity.ok(skills);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}


