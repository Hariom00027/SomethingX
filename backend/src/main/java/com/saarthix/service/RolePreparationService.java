package com.saarthix.service;

import com.saarthix.model.RolePreparation;
import com.saarthix.model.blueprint.Blueprint;
import com.saarthix.repository.RolePreparationRepository;
import com.saarthix.repository.blueprint.BlueprintRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RolePreparationService {

    private final RolePreparationRepository rolePreparationRepository;
    private final BlueprintRepository blueprintRepository;

    public RolePreparationService(RolePreparationRepository rolePreparationRepository, 
                                  BlueprintRepository blueprintRepository) {
        this.rolePreparationRepository = rolePreparationRepository;
        this.blueprintRepository = blueprintRepository;
    }

    public RolePreparation startPreparation(String studentId, String roleName) {
        // Check if preparation already exists
        Optional<RolePreparation> existing = rolePreparationRepository.findByStudentIdAndRoleName(studentId, roleName);
        if (existing.isPresent()) {
            RolePreparation prep = existing.get();
            if (prep.isActive()) {
                return prep; // Already active
            }
            // Reactivate
            prep.setActive(true);
            prep.setUpdatedAt(LocalDateTime.now());
            return rolePreparationRepository.save(prep);
        }

        // Get role blueprint to extract skills and plan
        Optional<Blueprint> roleOpt = blueprintRepository.findByNameAndType(roleName, "role");
        if (roleOpt.isEmpty()) {
            throw new RuntimeException("Role not found: " + roleName);
        }

        Blueprint role = roleOpt.get();
        
        // Create new preparation
        RolePreparation preparation = new RolePreparation();
        preparation.setStudentId(studentId);
        preparation.setRoleName(roleName);
        preparation.setPreparationStartDate(LocalDate.now());
        preparation.setActive(true);
        preparation.setCreatedAt(LocalDateTime.now());
        preparation.setUpdatedAt(LocalDateTime.now());
        
        // Initialize skill progress from role's skill requirements
        Map<String, RolePreparation.SkillProgress> skillProgress = new HashMap<>();
        
        if (role.getSkillRequirements() != null) {
            for (Blueprint.SkillRequirement skillReq : role.getSkillRequirements()) {
                RolePreparation.SkillProgress progress = new RolePreparation.SkillProgress();
                progress.setCompleted(false);
                // Calculate target date based on plan if available
                LocalDate targetDate = calculateTargetDateForSkill(skillReq, role, LocalDate.now());
                progress.setTargetDate(targetDate);
                skillProgress.put(skillReq.getSkillName(), progress);
            }
        }
        
        preparation.setSkillProgress(skillProgress);
        
        // Calculate target completion date from plan
        LocalDate targetCompletionDate = calculateTargetCompletionDate(role, LocalDate.now());
        preparation.setTargetCompletionDate(targetCompletionDate);
        
        return rolePreparationRepository.save(preparation);
    }

    public RolePreparation updateSkillCompletion(String studentId, String roleName, String skillName, boolean completed) {
        Optional<RolePreparation> prepOpt = rolePreparationRepository.findByStudentIdAndRoleName(studentId, roleName);
        if (prepOpt.isEmpty()) {
            throw new RuntimeException("Preparation not found for role: " + roleName);
        }

        RolePreparation preparation = prepOpt.get();
        Map<String, RolePreparation.SkillProgress> skillProgress = preparation.getSkillProgress();
        
        if (skillProgress == null) {
            skillProgress = new HashMap<>();
            preparation.setSkillProgress(skillProgress);
        }

        RolePreparation.SkillProgress progress = skillProgress.get(skillName);
        if (progress == null) {
            progress = new RolePreparation.SkillProgress();
            skillProgress.put(skillName, progress);
        }

        progress.setCompleted(completed);
        if (completed) {
            progress.setCompletedDate(LocalDate.now());
        } else {
            progress.setCompletedDate(null);
        }

        preparation.setUpdatedAt(LocalDateTime.now());
        return rolePreparationRepository.save(preparation);
    }

    public RolePreparation getPreparation(String studentId, String roleName) {
        return rolePreparationRepository.findByStudentIdAndRoleName(studentId, roleName)
                .orElse(null);
    }

    public List<RolePreparation> getAllPreparations(String studentId) {
        return rolePreparationRepository.findByStudentId(studentId);
    }

    public Map<String, Object> getAnalytics(String studentId, String roleName) {
        Optional<RolePreparation> prepOpt = rolePreparationRepository.findByStudentIdAndRoleName(studentId, roleName);
        if (prepOpt.isEmpty()) {
            throw new RuntimeException("Preparation not found for role: " + roleName);
        }

        RolePreparation preparation = prepOpt.get();
        Map<String, RolePreparation.SkillProgress> skillProgress = preparation.getSkillProgress();
        
        if (skillProgress == null) {
            skillProgress = new HashMap<>();
        }

        // Calculate statistics
        int totalSkills = skillProgress.size();
        long completedSkills = skillProgress.values().stream()
                .filter(RolePreparation.SkillProgress::isCompleted)
                .count();
        int remainingSkills = totalSkills - (int) completedSkills;

        // Skills by type
        Optional<Blueprint> roleOpt = blueprintRepository.findByNameAndType(roleName, "role");
        Map<String, Long> skillsByType = new HashMap<>();
        if (roleOpt.isPresent()) {
            Blueprint role = roleOpt.get();
            if (role.getSkillRequirements() != null) {
                for (Blueprint.SkillRequirement skillReq : role.getSkillRequirements()) {
                    String skillType = skillReq.getSkillType() != null ? skillReq.getSkillType() : "other";
                    RolePreparation.SkillProgress progress = skillProgress.get(skillReq.getSkillName());
                    if (progress != null && progress.isCompleted()) {
                        skillsByType.put(skillType, skillsByType.getOrDefault(skillType, 0L) + 1);
                    }
                }
            }
        }

        // Preparation progress (completed vs remaining)
        double completionPercentage = totalSkills > 0 ? (completedSkills * 100.0 / totalSkills) : 0;
        double remainingPercentage = 100.0 - completionPercentage;

        // Learning timeline (skills completed by month)
        Map<String, Integer> learningByMonth = new HashMap<>();
        for (RolePreparation.SkillProgress progress : skillProgress.values()) {
            if (progress.isCompleted() && progress.getCompletedDate() != null) {
                String monthKey = progress.getCompletedDate().getYear() + "-" + 
                                 String.format("%02d", progress.getCompletedDate().getMonthValue());
                learningByMonth.put(monthKey, learningByMonth.getOrDefault(monthKey, 0) + 1);
            }
        }

        // Skills with warnings (past target date)
        List<Map<String, Object>> skillsWithWarnings = new ArrayList<>();
        LocalDate today = LocalDate.now();
        if (roleOpt.isPresent()) {
            Blueprint role = roleOpt.get();
            if (role.getSkillRequirements() != null) {
                for (Blueprint.SkillRequirement skillReq : role.getSkillRequirements()) {
                    RolePreparation.SkillProgress progress = skillProgress.get(skillReq.getSkillName());
                    if (progress != null && progress.getTargetDate() != null && 
                        !progress.isCompleted() && progress.getTargetDate().isBefore(today)) {
                        Map<String, Object> warning = new HashMap<>();
                        warning.put("skillName", skillReq.getSkillName());
                        warning.put("targetDate", progress.getTargetDate().toString());
                        warning.put("daysOverdue", java.time.temporal.ChronoUnit.DAYS.between(progress.getTargetDate(), today));
                        skillsWithWarnings.add(warning);
                    }
                }
            }
        }

        // Build analytics response
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("roleName", roleName);
        analytics.put("preparationStartDate", preparation.getPreparationStartDate().toString());
        analytics.put("targetCompletionDate", preparation.getTargetCompletionDate() != null ? 
                     preparation.getTargetCompletionDate().toString() : null);
        analytics.put("totalSkills", totalSkills);
        analytics.put("completedSkills", completedSkills);
        analytics.put("remainingSkills", remainingSkills);
        analytics.put("completionPercentage", Math.round(completionPercentage * 100.0) / 100.0);
        analytics.put("remainingPercentage", Math.round(remainingPercentage * 100.0) / 100.0);
        analytics.put("skillsByType", skillsByType);
        analytics.put("learningByMonth", learningByMonth);
        analytics.put("skillsWithWarnings", skillsWithWarnings);
        
        // Additional stats
        analytics.put("daysSinceStart", java.time.temporal.ChronoUnit.DAYS.between(
                preparation.getPreparationStartDate(), LocalDate.now()));
        analytics.put("averageSkillsPerMonth", preparation.getPreparationStartDate() != null ? 
                     (completedSkills / Math.max(1, java.time.temporal.ChronoUnit.MONTHS.between(
                         preparation.getPreparationStartDate(), LocalDate.now()))) : 0);

        return analytics;
    }

    private LocalDate calculateTargetDateForSkill(Blueprint.SkillRequirement skillReq, Blueprint role, LocalDate startDate) {
        // Try to get target date from plan
        if (role.getPlan() != null && role.getPlan().get("tasks") != null) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> tasks = (List<Map<String, Object>>) role.getPlan().get("tasks");
            for (Map<String, Object> task : tasks) {
                if (skillReq.getSkillName().equals(task.get("name"))) {
                    Integer endMonth = (Integer) task.get("end");
                    if (endMonth != null) {
                        return startDate.plusMonths(endMonth);
                    }
                }
            }
        }
        // Fallback: use time required
        return startDate.plusMonths(skillReq.getTimeRequiredMonths());
    }

    private LocalDate calculateTargetCompletionDate(Blueprint role, LocalDate startDate) {
        // Try to get from plan
        if (role.getPlan() != null && role.getPlan().get("totalMonths") != null) {
            Integer totalMonths = (Integer) role.getPlan().get("totalMonths");
            if (totalMonths != null) {
                return startDate.plusMonths(totalMonths);
            }
        }
        // Fallback: calculate from skill requirements
        if (role.getSkillRequirements() != null && !role.getSkillRequirements().isEmpty()) {
            int maxMonths = role.getSkillRequirements().stream()
                    .mapToInt(sr -> sr.getTimeRequiredMonths())
                    .max()
                    .orElse(6);
            return startDate.plusMonths(maxMonths);
        }
        return startDate.plusMonths(6); // Default 6 months
    }
}

