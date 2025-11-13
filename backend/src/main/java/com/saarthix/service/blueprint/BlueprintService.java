package com.saarthix.service.blueprint;

import com.saarthix.model.blueprint.Blueprint;
import com.saarthix.model.User;
import com.saarthix.repository.blueprint.BlueprintRepository;
import com.saarthix.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BlueprintService {

    private final BlueprintRepository blueprintRepository;
    private final UserRepository userRepository;

    public BlueprintService(BlueprintRepository blueprintRepository, UserRepository userRepository) {
        this.blueprintRepository = blueprintRepository;
        this.userRepository = userRepository;
    }

    public List<Blueprint> getAllBlueprints() {
        return blueprintRepository.findAll();
    }

    public List<String> getIndustries() {
        return blueprintRepository.findByType("industry").stream()
                .map(Blueprint::getName)
                .collect(Collectors.toList());
    }

    public List<String> getEducations() {
        return blueprintRepository.findByType("education").stream()
                .map(Blueprint::getName)
                .collect(Collectors.toList());
    }

    public List<String> getSpecializations() {
        return blueprintRepository.findByType("specialization").stream()
                .map(Blueprint::getName)
                .collect(Collectors.toList());
    }

    public List<String> getRolesByIndustry(String industryName) {
        Optional<Blueprint> industry = blueprintRepository.findByNameAndType(industryName, "industry");
        return industry.map(Blueprint::getRoles).orElse(List.of());
    }

    public List<String> getEducationByIndustry(String industryName) {
        Optional<Blueprint> industry = blueprintRepository.findByNameAndType(industryName, "industry");
        return industry.map(Blueprint::getEducations).orElse(List.of());
    }

    public List<String> getSpecializationsByEducation(String educationName) {
        Optional<Blueprint> education = blueprintRepository.findByNameAndType(educationName, "education");
        return education.map(Blueprint::getSpecializations).orElse(List.of());
    }

    public List<String> getRolesBySpecialization(String specializationName) {
        Optional<Blueprint> specialization = blueprintRepository.findByNameAndType(specializationName, "specialization");
        return specialization.map(Blueprint::getRoles).orElse(List.of());
    }

    public List<String> getAllRoles() {
        return blueprintRepository.findByType("role").stream()
                .map(Blueprint::getName)
                .collect(Collectors.toList());
    }

    public Blueprint getRoleDetails(String roleName) {
        return blueprintRepository.findByNameAndType(roleName, "role").orElse(null);
    }

    public Blueprint getRoleDetailsWithGanttChart(String roleName, String userId, Integer customDuration) {
        Blueprint roleDetails = blueprintRepository.findByNameAndType(roleName, "role").orElse(null);
        if (roleDetails == null) {
            return null;
        }

        // Get user information
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return roleDetails; // Return original if user not found
        }

        User user = userOpt.get();
        
        // Calculate remaining education time
        int remainingMonths = customDuration != null ? customDuration : calculateRemainingEducationTime(user);
        
        // Generate Gantt chart data
        Map<String, Object> ganttChartData = generateGanttChartData(roleDetails, remainingMonths);
        
        // Create a new Blueprint with Gantt chart data
        Blueprint blueprintWithGantt = new Blueprint();
        blueprintWithGantt.setId(roleDetails.getId());
        blueprintWithGantt.setType(roleDetails.getType());
        blueprintWithGantt.setName(roleDetails.getName());
        blueprintWithGantt.setJobDescription(roleDetails.getJobDescription());
        blueprintWithGantt.setSkills(roleDetails.getSkills());
        blueprintWithGantt.setSkillRequirements(roleDetails.getSkillRequirements());
        blueprintWithGantt.setDescription(roleDetails.getDescription());
        blueprintWithGantt.setPlan(ganttChartData);
        
        return blueprintWithGantt;
    }

    private int calculateRemainingEducationTime(User user) {
        try {
            String expectedGraduationYear = user.getExpectedGraduationYear();
            String expectedGraduationMonth = user.getExpectedGraduationMonth();
            
            if (expectedGraduationYear == null || expectedGraduationYear.isEmpty()) {
                return 12; // Default to 12 months if no graduation year
            }
            
            int graduationYear = Integer.parseInt(expectedGraduationYear);
            int graduationMonth = (expectedGraduationMonth != null && !expectedGraduationMonth.isEmpty()) 
                ? Integer.parseInt(expectedGraduationMonth) : 6; // Default to June if no month specified
            
            LocalDate currentDate = LocalDate.now();
            LocalDate graduationDate = LocalDate.of(graduationYear, graduationMonth, 1);
            
            // Calculate months between current date and graduation date
            long monthsRemaining = java.time.temporal.ChronoUnit.MONTHS.between(currentDate, graduationDate);
            
            // Ensure minimum of 3 months and maximum of 24 months
            int result = (int) Math.max(3, Math.min(24, monthsRemaining));
            
            return result;
        } catch (Exception e) {
            return 12; // Default to 12 months on error
        }
    }

    private Map<String, Object> generateGanttChartData(Blueprint roleDetails, int totalMonths) {
        Map<String, Object> ganttData = new HashMap<>();
        List<String> warnings = new ArrayList<>();
        
        // Create timeline labels
        List<String> labels = new ArrayList<>();
        for (int i = 1; i <= totalMonths; i++) {
            labels.add("Month " + i);
        }
        
        // Create skill development tasks based on skill requirements
        List<Map<String, Object>> tasks = new ArrayList<>();
        
        if (roleDetails.getSkillRequirements() == null || roleDetails.getSkillRequirements().isEmpty()) {
            // No skill requirements available
            ganttData.put("labels", labels);
            ganttData.put("tasks", tasks);
            ganttData.put("totalMonths", totalMonths);
            ganttData.put("chartType", "gantt");
            ganttData.put("warnings", warnings);
            return ganttData;
        }
        
        // Calculate total time required for all skills
        int totalTimeRequired = roleDetails.getSkillRequirements().stream()
                .mapToInt(Blueprint.SkillRequirement::getTimeRequiredMonths)
                .sum();
        
        // Check if time is insufficient
        if (totalTimeRequired > totalMonths) {
            warnings.add("Warning: The total time required (" + totalTimeRequired + " months) exceeds the available time (" + totalMonths + " months). Essential skills will be prioritized, and other skills will be scheduled in parallel.");
        }
        
        // Sort skills by priority: Importance (Essential > Important > Good to be), then by difficulty (beginner < intermediate < advanced)
        List<Blueprint.SkillRequirement> sortedSkills = new ArrayList<>(roleDetails.getSkillRequirements());
        sortedSkills.sort((s1, s2) -> {
            // First, compare by importance
            int importance1 = getImportancePriority(s1.getImportance());
            int importance2 = getImportancePriority(s2.getImportance());
            if (importance1 != importance2) {
                return Integer.compare(importance1, importance2); // Lower number = higher priority
            }
            
            // If importance is same, compare by difficulty (beginner first)
            int difficulty1 = getDifficultyPriority(s1.getDifficulty());
            int difficulty2 = getDifficultyPriority(s2.getDifficulty());
            if (difficulty1 != difficulty2) {
                return Integer.compare(difficulty1, difficulty2);
            }
            
            // If both are same, prioritize shorter skills first
            return Integer.compare(s1.getTimeRequiredMonths(), s2.getTimeRequiredMonths());
        });
        
        // Track which months are allocated to which skills (for parallel learning)
        // Store skill details for each month to check compatibility
        Map<Integer, List<Map<String, Object>>> monthAllocations = new HashMap<>();
        for (int i = 1; i <= totalMonths; i++) {
            monthAllocations.put(i, new ArrayList<>());
        }
        
        // Allocate skills to timeline
        for (Blueprint.SkillRequirement skillReq : sortedSkills) {
            int skillTime = skillReq.getTimeRequiredMonths();
            String skillName = skillReq.getSkillName();
            // Map old skill types to new ones for backward compatibility
            String rawSkillType = skillReq.getSkillType();
            String skillType = normalizeSkillType(rawSkillType);
            String difficulty = skillReq.getDifficulty();
            
            // Find the best starting position for this skill
            int startMonth = findBestStartMonth(monthAllocations, skillTime, totalMonths, skillReq);
            
            if (startMonth > 0) {
                int endMonth = Math.min(startMonth + skillTime - 1, totalMonths);
                
                // Allocate months for this skill
                for (int month = startMonth; month <= endMonth; month++) {
                    Map<String, Object> skillInfo = new HashMap<>();
                    skillInfo.put("name", skillName);
                    skillInfo.put("type", skillType);
                    skillInfo.put("difficulty", difficulty);
                    monthAllocations.get(month).add(skillInfo);
                }
                
                Map<String, Object> task = new HashMap<>();
                task.put("id", "skill_" + skillName.replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9_]", ""));
                task.put("name", skillName);
                task.put("start", startMonth);
                task.put("end", endMonth);
                task.put("type", skillType);
                task.put("difficulty", difficulty);
                task.put("importance", skillReq.getImportance());
                task.put("description", skillReq.getDescription());
                task.put("timeRequired", skillReq.getTimeRequiredMonths());
                task.put("progress", 0);
                tasks.add(task);
            } else {
                // Could not allocate - skill will be scheduled in parallel with others
                // Find any available slot or overlap with compatible skills
                int fallbackStart = 1;
                int fallbackEnd = Math.min(fallbackStart + skillTime - 1, totalMonths);
                
                // Allocate in parallel
                for (int month = fallbackStart; month <= fallbackEnd; month++) {
                    Map<String, Object> skillInfo = new HashMap<>();
                    skillInfo.put("name", skillName);
                    skillInfo.put("type", skillType);
                    skillInfo.put("difficulty", difficulty);
                    monthAllocations.get(month).add(skillInfo);
                }
                
                Map<String, Object> task = new HashMap<>();
                task.put("id", "skill_" + skillName.replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9_]", ""));
                task.put("name", skillName);
                task.put("start", fallbackStart);
                task.put("end", fallbackEnd);
                task.put("type", skillType);
                task.put("difficulty", difficulty);
                task.put("importance", skillReq.getImportance());
                task.put("description", skillReq.getDescription());
                task.put("timeRequired", skillReq.getTimeRequiredMonths());
                task.put("progress", 0);
                task.put("parallel", true); // Mark as parallel learning
                tasks.add(task);
            }
        }
        
        // If there's excess time, extend skill learning periods
        int allocatedTime = tasks.stream()
                .mapToInt(t -> (Integer) t.get("end") - (Integer) t.get("start") + 1)
                .sum();
        
        if (allocatedTime < totalMonths && totalTimeRequired < totalMonths) {
            int excessTime = totalMonths - Math.max(allocatedTime, totalTimeRequired);
            // Distribute excess time to essential and important skills
            distributeExcessTime(tasks, excessTime, totalMonths);
        }
        
        // Check if there's spare time after all skills are completed
        int maxEndMonth = tasks.stream()
                .mapToInt(t -> (Integer) t.get("end"))
                .max()
                .orElse(0);
        
        boolean hasSpareTime = maxEndMonth < totalMonths && totalTimeRequired < totalMonths;
        if (hasSpareTime) {
            int spareMonths = totalMonths - maxEndMonth;
            ganttData.put("hasSpareTime", true);
            ganttData.put("spareMonths", spareMonths);
        } else {
            ganttData.put("hasSpareTime", false);
        }
        
        ganttData.put("labels", labels);
        ganttData.put("tasks", tasks);
        ganttData.put("totalMonths", totalMonths);
        ganttData.put("chartType", "gantt");
        ganttData.put("warnings", warnings);
        
        return ganttData;
    }
    
    private int getImportancePriority(String importance) {
        if (importance == null) return 3; // Default to lowest priority
        switch (importance.toLowerCase()) {
            case "essential": return 1; // Highest priority
            case "important": return 2;
            case "good to be": return 3; // Lowest priority
            default: return 3;
        }
    }
    
    private int getDifficultyPriority(String difficulty) {
        if (difficulty == null) return 2;
        switch (difficulty.toLowerCase()) {
            case "beginner": return 1; // Start with beginner
            case "intermediate": return 2;
            case "advanced": return 3; // Advanced last
            default: return 2;
        }
    }
    
    // Normalize skill types for backward compatibility
    private String normalizeSkillType(String skillType) {
        if (skillType == null) return "technical";
        String normalized = skillType.toLowerCase().trim();
        // Map old types to new ones
        if ("soft".equals(normalized) || "certification".equals(normalized) || "non-technical".equals(normalized)) {
            return "non-technical";
        }
        if ("technical".equals(normalized)) {
            return "technical";
        }
        // Default to technical for unknown types
        return "technical";
    }
    
    private int findBestStartMonth(Map<Integer, List<Map<String, Object>>> monthAllocations, int skillTime, int totalMonths, Blueprint.SkillRequirement skillReq) {
        // Normalize skill type for consistency
        String rawSkillType = skillReq.getSkillType();
        String skillType = normalizeSkillType(rawSkillType);
        String difficulty = skillReq.getDifficulty();
        boolean isTechnical = "technical".equalsIgnoreCase(skillType);
        int difficultyLevel = getDifficultyPriority(difficulty);
        
        // For essential skills, try to find consecutive months with minimal incompatible overlap
        if ("Essential".equalsIgnoreCase(skillReq.getImportance())) {
            int bestStart = 0;
            int minIncompatibleOverlaps = Integer.MAX_VALUE;
            
            for (int start = 1; start <= totalMonths - skillTime + 1; start++) {
                int incompatibleOverlaps = 0;
                boolean canFit = true;
                
                for (int i = 0; i < skillTime; i++) {
                    int month = start + i;
                    if (month > totalMonths) {
                        canFit = false;
                        break;
                    }
                    List<Map<String, Object>> existing = monthAllocations.get(month);
                    // Count incompatible overlaps
                    for (Map<String, Object> existingSkill : existing) {
                        String existingType = (String) existingSkill.get("type");
                        String existingDifficulty = (String) existingSkill.get("difficulty");
                        boolean existingIsTechnical = "technical".equalsIgnoreCase(existingType);
                        int existingDifficultyLevel = getDifficultyPriority(existingDifficulty);
                        
                        // Incompatible if: both are technical AND both are advanced difficulty
                        // Allow: non-technical with technical, less difficult with more difficult
                        if (isTechnical && existingIsTechnical && difficultyLevel == 3 && existingDifficultyLevel == 3) {
                            // Both are advanced technical skills - prefer not to overlap
                            incompatibleOverlaps++;
                        }
                        // All other combinations are allowed (non-technical with technical, beginner/intermediate with advanced)
                    }
                }
                
                if (canFit && incompatibleOverlaps < minIncompatibleOverlaps) {
                    minIncompatibleOverlaps = incompatibleOverlaps;
                    bestStart = start;
                }
            }
            
            if (bestStart > 0) {
                return bestStart;
            }
        }
        
        // For other skills, find slot with least incompatible overlap (allow parallel learning)
        int bestStart = 1;
        int minIncompatibleOverlaps = Integer.MAX_VALUE;
        
        for (int start = 1; start <= totalMonths - skillTime + 1; start++) {
            int incompatibleOverlaps = 0;
            for (int i = 0; i < skillTime; i++) {
                int month = start + i;
                if (month <= totalMonths) {
                    List<Map<String, Object>> existing = monthAllocations.get(month);
                    // Count incompatible overlaps
                    for (Map<String, Object> existingSkill : existing) {
                        String existingType = (String) existingSkill.get("type");
                        String existingDifficulty = (String) existingSkill.get("difficulty");
                        boolean existingIsTechnical = "technical".equalsIgnoreCase(existingType);
                        int existingDifficultyLevel = getDifficultyPriority(existingDifficulty);
                        
                        // Incompatible if: both are technical AND both are advanced difficulty
                        // Allow: non-technical with technical, less difficult with more difficult
                        if (isTechnical && existingIsTechnical && difficultyLevel == 3 && existingDifficultyLevel == 3) {
                            // Both are advanced technical skills - prefer not to overlap
                            incompatibleOverlaps++;
                        }
                        // All other combinations are allowed (non-technical with technical, beginner/intermediate with advanced)
                    }
                }
            }
            
            if (incompatibleOverlaps < minIncompatibleOverlaps) {
                minIncompatibleOverlaps = incompatibleOverlaps;
                bestStart = start;
            }
        }
        
        return bestStart;
    }
    
    private void distributeExcessTime(List<Map<String, Object>> tasks, int excessTime, int totalMonths) {
        // Sort tasks by importance and extend essential/important skills first
        List<Map<String, Object>> sortedTasks = new ArrayList<>(tasks);
        sortedTasks.sort((t1, t2) -> {
            String imp1 = (String) t1.getOrDefault("importance", "Good to be");
            String imp2 = (String) t2.getOrDefault("importance", "Good to be");
            int priority1 = getImportancePriority(imp1);
            int priority2 = getImportancePriority(imp2);
            return Integer.compare(priority1, priority2);
        });
        
        int remainingExcess = excessTime;
        for (Map<String, Object> task : sortedTasks) {
            if (remainingExcess <= 0) break;
            
            // Skip project phase
            if ("project".equals(task.get("type"))) continue;
            
            int currentEnd = (Integer) task.get("end");
            int timeRequired = (Integer) task.get("timeRequired");
            int currentDuration = currentEnd - (Integer) task.get("start") + 1;
            
            // If current duration is less than time required, extend it
            if (currentDuration < timeRequired && currentEnd < totalMonths) {
                int extension = Math.min(remainingExcess, timeRequired - currentDuration);
                int newEnd = Math.min(currentEnd + extension, totalMonths);
                task.put("end", newEnd);
                remainingExcess -= (newEnd - currentEnd);
            } else if (currentEnd < totalMonths) {
                // Even if duration matches, extend slightly for better learning
                int extension = Math.min(remainingExcess, 1);
                int newEnd = Math.min(currentEnd + extension, totalMonths);
                task.put("end", newEnd);
                remainingExcess -= extension;
            }
        }
    }

    public boolean mapRoleToIndustry(String roleName, String industryName) {
        try {
            // Find the role
            Optional<Blueprint> roleOpt = blueprintRepository.findByNameAndType(roleName, "role");
            if (roleOpt.isEmpty()) {
                return false;
            }

            // Find the industry
            Optional<Blueprint> industryOpt = blueprintRepository.findByNameAndType(industryName, "industry");
            if (industryOpt.isEmpty()) {
                return false;
            }

            Blueprint industry = industryOpt.get();
            
            // Add role to industry's roles list if not already present
            if (industry.getRoles() == null) {
                industry.setRoles(new ArrayList<>());
            }
            if (!industry.getRoles().contains(roleName)) {
                industry.getRoles().add(roleName);
                blueprintRepository.save(industry);
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean mapRoleToEducation(String roleName, String educationName) {
        try {
            // Find the role
            Optional<Blueprint> roleOpt = blueprintRepository.findByNameAndType(roleName, "role");
            if (roleOpt.isEmpty()) {
                return false;
            }

            // Find the education
            Optional<Blueprint> educationOpt = blueprintRepository.findByNameAndType(educationName, "education");
            if (educationOpt.isEmpty()) {
                return false;
            }

            Blueprint education = educationOpt.get();
            
            // Add role to education's roles list if not already present
            if (education.getRoles() == null) {
                education.setRoles(new ArrayList<>());
            }
            if (!education.getRoles().contains(roleName)) {
                education.getRoles().add(roleName);
                blueprintRepository.save(education);
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean mapIndustryToEducation(String industryName, String educationName) {
        try {
            // Find the industry
            Optional<Blueprint> industryOpt = blueprintRepository.findByNameAndType(industryName, "industry");
            if (industryOpt.isEmpty()) {
                return false;
            }

            // Find the education
            Optional<Blueprint> educationOpt = blueprintRepository.findByNameAndType(educationName, "education");
            if (educationOpt.isEmpty()) {
                return false;
            }

            Blueprint industry = industryOpt.get();
            
            // Add education to industry's educations list if not already present
            if (industry.getEducations() == null) {
                industry.setEducations(new ArrayList<>());
            }
            if (!industry.getEducations().contains(educationName)) {
                industry.getEducations().add(educationName);
                blueprintRepository.save(industry);
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean mapSpecializationToEducation(String specializationName, String educationName) {
        try {
            // Find the specialization
            Optional<Blueprint> specializationOpt = blueprintRepository.findByNameAndType(specializationName, "specialization");
            if (specializationOpt.isEmpty()) {
                return false;
            }

            // Find the education
            Optional<Blueprint> educationOpt = blueprintRepository.findByNameAndType(educationName, "education");
            if (educationOpt.isEmpty()) {
                return false;
            }

            Blueprint education = educationOpt.get();
            
            // Add specialization to education's specializations list if not already present
            if (education.getSpecializations() == null) {
                education.setSpecializations(new ArrayList<>());
            }
            if (!education.getSpecializations().contains(specializationName)) {
                education.getSpecializations().add(specializationName);
                blueprintRepository.save(education);
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean mapRoleToSpecialization(String roleName, String specializationName) {
        try {
            // Find the role
            Optional<Blueprint> roleOpt = blueprintRepository.findByNameAndType(roleName, "role");
            if (roleOpt.isEmpty()) {
                return false;
            }

            // Find the specialization
            Optional<Blueprint> specializationOpt = blueprintRepository.findByNameAndType(specializationName, "specialization");
            if (specializationOpt.isEmpty()) {
                return false;
            }

            Blueprint specialization = specializationOpt.get();
            
            // Add role to specialization's roles list if not already present
            if (specialization.getRoles() == null) {
                specialization.setRoles(new ArrayList<>());
            }
            if (!specialization.getRoles().contains(roleName)) {
                specialization.getRoles().add(roleName);
                blueprintRepository.save(specialization);
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Map<String, Object> getRoleMappings(String roleName) {
        Map<String, Object> mappings = new HashMap<>();
        
        // Find industries that contain this role
        List<String> industries = blueprintRepository.findByType("industry").stream()
                .filter(industry -> industry.getRoles() != null && industry.getRoles().contains(roleName))
                .map(Blueprint::getName)
                .collect(Collectors.toList());
        
        // Find educations that contain this role
        List<String> educations = blueprintRepository.findByType("education").stream()
                .filter(education -> education.getRoles() != null && education.getRoles().contains(roleName))
                .map(Blueprint::getName)
                .collect(Collectors.toList());
        
        mappings.put("industries", industries);
        mappings.put("educations", educations);
        
        return mappings;
    }
}


