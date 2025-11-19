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
            ganttData.put("labels", labels);
            ganttData.put("tasks", tasks);
            ganttData.put("totalMonths", totalMonths);
            ganttData.put("chartType", "gantt");
            ganttData.put("warnings", warnings);
            ganttData.put("leftoverMonths", totalMonths);
            ganttData.put("doNotExtendDurations", true);
            ganttData.put("leftoverSuggestion", totalMonths > 0 ? 
                totalMonths + " months remain unused. Consider adding elective skills, practice projects, or internships." : 
                "No skills to schedule.");
            return ganttData;
        }
        
        // Validate and sanitize durations
        List<Blueprint.SkillRequirement> validSkills = new ArrayList<>();
        for (Blueprint.SkillRequirement skill : roleDetails.getSkillRequirements()) {
            int duration = skill.getTimeRequiredMonths();
            if (duration < 1) {
                warnings.add("Skill '" + skill.getSkillName() + "' has invalid duration (" + duration + "), setting to 1 month.");
                skill.setTimeRequiredMonths(1);
            }
            validSkills.add(skill);
        }
        
        // Calculate total time required
        int totalTimeRequired = validSkills.stream()
                .mapToInt(Blueprint.SkillRequirement::getTimeRequiredMonths)
                .sum();
        
        // Check for prerequisite cycles
        if (hasPrerequisiteCycle(validSkills)) {
            warnings.add("ERROR: Circular prerequisite dependency detected. Please fix the blueprint prerequisites.");
            ganttData.put("labels", labels);
            ganttData.put("tasks", tasks);
            ganttData.put("totalMonths", totalMonths);
            ganttData.put("chartType", "gantt");
            ganttData.put("warnings", warnings);
            ganttData.put("leftoverMonths", totalMonths);
            ganttData.put("doNotExtendDurations", true);
            ganttData.put("leftoverSuggestion", "Cannot schedule due to prerequisite cycle.");
            return ganttData;
        }
        
        // Check if time is insufficient
        if (totalTimeRequired > totalMonths) {
            warnings.add("Insufficient time: The total time required (" + totalTimeRequired + " months) exceeds the available time (" + totalMonths + " months). A prioritized subset will be scheduled.");
        }
        
        // Configuration: maxParallel (default 3, can be made configurable)
        int maxParallel = 3;
        
        // Execute greedy scheduling algorithm
        GanttScheduleResult result = greedySchedule(validSkills, totalMonths, maxParallel);
        
        tasks = result.tasks;
        warnings.addAll(result.warnings);
        
        // Calculate leftover months (do NOT extend durations)
        int maxEndMonth = tasks.stream()
                .mapToInt(t -> (Integer) t.get("end"))
                .max()
                .orElse(0);
        int leftoverMonths = Math.max(0, totalMonths - maxEndMonth);
        
        // Build leftover suggestion
        String leftoverSuggestion = "";
        if (leftoverMonths > 0) {
            leftoverSuggestion = leftoverMonths + " months remain unused. Consider adding elective skills, practice projects, or internships. Durations of existing skills were NOT extended.";
        } else if (leftoverMonths == 0 && maxEndMonth == totalMonths) {
            leftoverSuggestion = "All available time has been utilized.";
        } else {
            leftoverSuggestion = "Schedule complete.";
        }
        
        ganttData.put("labels", labels);
        ganttData.put("tasks", tasks);
        ganttData.put("totalMonths", totalMonths);
        ganttData.put("chartType", "gantt");
        ganttData.put("warnings", warnings);
        ganttData.put("leftoverMonths", leftoverMonths);
        ganttData.put("doNotExtendDurations", true);
        ganttData.put("leftoverSuggestion", leftoverSuggestion);
        
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
    
    /**
     * Result class for greedy scheduling
     */
    private static class GanttScheduleResult {
        List<Map<String, Object>> tasks = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
    }
    
    /**
     * Greedy deterministic scheduling algorithm
     */
    private GanttScheduleResult greedySchedule(List<Blueprint.SkillRequirement> skills, int totalMonths, int maxParallel) {
        GanttScheduleResult result = new GanttScheduleResult();
        
        // Build prerequisite graph and topological sort
        Map<String, List<String>> prereqMap = new HashMap<>();
        Map<String, Blueprint.SkillRequirement> skillMap = new HashMap<>();
        for (Blueprint.SkillRequirement skill : skills) {
            skillMap.put(skill.getSkillName(), skill);
            if (skill.getPrerequisites() != null && !skill.getPrerequisites().isEmpty()) {
                prereqMap.put(skill.getSkillName(), new ArrayList<>(skill.getPrerequisites()));
            }
        }
        
        List<String> topoOrder = topologicalSort(skills, prereqMap);
        if (topoOrder == null) {
            result.warnings.add("Topological sort failed - prerequisite cycle detected.");
            return result;
        }
        
        // Partition skills
        List<Blueprint.SkillRequirement> criticalTech = new ArrayList<>();
        List<Blueprint.SkillRequirement> criticalNonTech = new ArrayList<>();
        List<Blueprint.SkillRequirement> others = new ArrayList<>();
        
        for (String skillName : topoOrder) {
            Blueprint.SkillRequirement skill = skillMap.get(skillName);
            if (skill == null) continue;
            
            boolean isEssential = "Essential".equalsIgnoreCase(skill.getImportance());
            boolean isAdvanced = "advanced".equalsIgnoreCase(skill.getDifficulty());
            boolean isTechnical = "technical".equalsIgnoreCase(normalizeSkillType(skill.getSkillType()));
            
            if (isEssential && isAdvanced) {
                if (isTechnical) {
                    criticalTech.add(skill);
                } else {
                    criticalNonTech.add(skill);
                }
            } else {
                others.add(skill);
            }
        }
        
        // Sort by priority: importance desc, difficulty asc, time asc
        criticalTech.sort(this::compareSkillsByPriority);
        criticalNonTech.sort(this::compareSkillsByPriority);
        others.sort(this::compareSkillsByPriority);
        
        // Track schedule state
        Map<String, Integer> skillStart = new HashMap<>();
        Map<String, Integer> skillEnd = new HashMap<>();
        Map<Integer, List<String>> monthActiveSkills = new HashMap<>();
        for (int i = 1; i <= totalMonths; i++) {
            monthActiveSkills.put(i, new ArrayList<>());
        }
        
        // Phase 1: Schedule critical technical skills sequentially (NO OVERLAP)
        for (Blueprint.SkillRequirement skill : criticalTech) {
            int start = findEarliestStartForCriticalTech(skill, skillStart, skillEnd, prereqMap, 
                    monthActiveSkills, totalMonths, maxParallel, skillMap);
            if (start == -1) {
                result.warnings.add("Cannot schedule critical technical skill '" + skill.getSkillName() + 
                    "' - insufficient time or constraint violation.");
                continue;
            }
            
            int duration = skill.getTimeRequiredMonths();
            int end = Math.min(start + duration - 1, totalMonths);
            skillStart.put(skill.getSkillName(), start);
            skillEnd.put(skill.getSkillName(), end);
            
            // Mark months as active
            for (int month = start; month <= end; month++) {
                monthActiveSkills.get(month).add(skill.getSkillName());
            }
        }
        
        // Phase 2: Schedule critical non-technical skills (can parallel with critical tech)
        for (Blueprint.SkillRequirement skill : criticalNonTech) {
            int start = findEarliestStart(skill, skillStart, skillEnd, prereqMap, 
                    monthActiveSkills, totalMonths, maxParallel, false, skillMap);
            if (start == -1) {
                result.warnings.add("Cannot schedule critical non-technical skill '" + skill.getSkillName() + 
                    "' - insufficient time or constraint violation.");
                continue;
            }
            
            int duration = skill.getTimeRequiredMonths();
            int end = Math.min(start + duration - 1, totalMonths);
            skillStart.put(skill.getSkillName(), start);
            skillEnd.put(skill.getSkillName(), end);
            
            for (int month = start; month <= end; month++) {
                monthActiveSkills.get(month).add(skill.getSkillName());
            }
        }
        
        // Phase 3: Schedule other skills
        for (Blueprint.SkillRequirement skill : others) {
            int start = findEarliestStart(skill, skillStart, skillEnd, prereqMap, 
                    monthActiveSkills, totalMonths, maxParallel, true, skillMap);
            if (start == -1) {
                result.warnings.add("Cannot schedule skill '" + skill.getSkillName() + 
                    "' - insufficient time or constraint violation.");
                continue;
            }
            
            int duration = skill.getTimeRequiredMonths();
            int end = Math.min(start + duration - 1, totalMonths);
            skillStart.put(skill.getSkillName(), start);
            skillEnd.put(skill.getSkillName(), end);
            
            for (int month = start; month <= end; month++) {
                monthActiveSkills.get(month).add(skill.getSkillName());
            }
        }
        
        // Compact schedule (move tasks earlier without violating constraints)
        compactScheduleGreedy(skillStart, skillEnd, prereqMap, monthActiveSkills, totalMonths, maxParallel, skillMap);
        
        // Build task list from schedule
        for (Blueprint.SkillRequirement skill : skills) {
            String skillName = skill.getSkillName();
            if (skillStart.containsKey(skillName)) {
                int start = skillStart.get(skillName);
                int end = skillEnd.get(skillName);
                
                Map<String, Object> task = createTask(skill, start, end);
                
                // Check if parallel
                boolean isParallel = false;
                for (int month = start; month <= end; month++) {
                    if (monthActiveSkills.get(month).size() > 1) {
                        isParallel = true;
                        break;
                    }
                }
                if (isParallel) {
                    task.put("parallel", true);
                }
                
                result.tasks.add(task);
            }
        }
        
        // Check for advanced technical overlaps (soft warning)
        checkAdvancedTechnicalOverlaps(result.tasks, result.warnings, skillMap);
        
        return result;
    }
    
    /**
     * Creates a task map for a skill requirement
     */
    private Map<String, Object> createTask(Blueprint.SkillRequirement skillReq, int startMonth, int endMonth) {
        Map<String, Object> task = new HashMap<>();
        String skillName = skillReq.getSkillName();
        task.put("id", "skill_" + skillName.replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9_]", ""));
        task.put("name", skillName);
        task.put("start", startMonth);
        task.put("end", endMonth);
        task.put("type", normalizeSkillType(skillReq.getSkillType()));
        task.put("difficulty", skillReq.getDifficulty());
        task.put("importance", skillReq.getImportance());
        task.put("description", skillReq.getDescription());
        task.put("timeRequired", skillReq.getTimeRequiredMonths());
        task.put("progress", 0);
        return task;
    }
    
    /**
     * Compares skills by priority: importance desc, difficulty asc, time asc
     */
    private int compareSkillsByPriority(Blueprint.SkillRequirement s1, Blueprint.SkillRequirement s2) {
        int imp1 = getImportancePriority(s1.getImportance());
        int imp2 = getImportancePriority(s2.getImportance());
        if (imp1 != imp2) {
            return Integer.compare(imp1, imp2); // Lower number = higher priority
        }
        
        int diff1 = getDifficultyPriority(s1.getDifficulty());
        int diff2 = getDifficultyPriority(s2.getDifficulty());
        if (diff1 != diff2) {
            return Integer.compare(diff1, diff2); // Lower difficulty first
        }
        
        return Integer.compare(s1.getTimeRequiredMonths(), s2.getTimeRequiredMonths()); // Shorter first
    }
    
    /**
     * Checks for prerequisite cycles using DFS
     */
    private boolean hasPrerequisiteCycle(List<Blueprint.SkillRequirement> skills) {
        Map<String, List<String>> graph = new HashMap<>();
        Map<String, Blueprint.SkillRequirement> skillMap = new HashMap<>();
        
        for (Blueprint.SkillRequirement skill : skills) {
            skillMap.put(skill.getSkillName(), skill);
            graph.put(skill.getSkillName(), new ArrayList<>());
        }
        
        for (Blueprint.SkillRequirement skill : skills) {
            if (skill.getPrerequisites() != null) {
                for (String prereq : skill.getPrerequisites()) {
                    if (graph.containsKey(prereq)) {
                        graph.get(skill.getSkillName()).add(prereq);
                    }
                }
            }
        }
        
        Set<String> visited = new HashSet<>();
        Set<String> recStack = new HashSet<>();
        
        for (String skillName : graph.keySet()) {
            if (hasCycleDFS(skillName, graph, visited, recStack)) {
                return true;
            }
        }
        
        return false;
    }
    
    private boolean hasCycleDFS(String node, Map<String, List<String>> graph, Set<String> visited, Set<String> recStack) {
        if (recStack.contains(node)) {
            return true; // Cycle detected
        }
        if (visited.contains(node)) {
            return false;
        }
        
        visited.add(node);
        recStack.add(node);
        
        for (String neighbor : graph.getOrDefault(node, Collections.emptyList())) {
            if (hasCycleDFS(neighbor, graph, visited, recStack)) {
                return true;
            }
        }
        
        recStack.remove(node);
        return false;
    }
    
    /**
     * Topological sort of skills respecting prerequisites
     */
    private List<String> topologicalSort(List<Blueprint.SkillRequirement> skills, Map<String, List<String>> prereqMap) {
        Map<String, List<String>> graph = new HashMap<>();
        Map<String, Integer> inDegree = new HashMap<>();
        
        // Initialize
        for (Blueprint.SkillRequirement skill : skills) {
            String name = skill.getSkillName();
            graph.put(name, new ArrayList<>());
            inDegree.put(name, 0);
        }
        
        // Build graph and calculate in-degrees
        for (Blueprint.SkillRequirement skill : skills) {
            String name = skill.getSkillName();
            if (prereqMap.containsKey(name)) {
                for (String prereq : prereqMap.get(name)) {
                    if (graph.containsKey(prereq)) {
                        graph.get(prereq).add(name);
                        inDegree.put(name, inDegree.get(name) + 1);
                    }
                }
            }
        }
        
        // Kahn's algorithm
        Queue<String> queue = new LinkedList<>();
        for (String skillName : inDegree.keySet()) {
            if (inDegree.get(skillName) == 0) {
                queue.offer(skillName);
            }
        }
        
        List<String> result = new ArrayList<>();
        while (!queue.isEmpty()) {
            String current = queue.poll();
            result.add(current);
            
            for (String neighbor : graph.get(current)) {
                inDegree.put(neighbor, inDegree.get(neighbor) - 1);
                if (inDegree.get(neighbor) == 0) {
                    queue.offer(neighbor);
                }
            }
        }
        
        // Check for cycle
        if (result.size() != skills.size()) {
            return null; // Cycle detected
        }
        
        return result;
    }
    
    /**
     * Finds earliest start for critical technical skill (no overlap with other critical tech)
     */
    private int findEarliestStartForCriticalTech(Blueprint.SkillRequirement skill, 
                                                  Map<String, Integer> skillStart,
                                                  Map<String, Integer> skillEnd,
                                                  Map<String, List<String>> prereqMap,
                                                  Map<Integer, List<String>> monthActiveSkills,
                                                  int totalMonths, int maxParallel,
                                                  Map<String, Blueprint.SkillRequirement> skillMap) {
        int duration = skill.getTimeRequiredMonths();
        
        // Find earliest start respecting prerequisites
        int earliestAfterPrereqs = 1;
        if (prereqMap.containsKey(skill.getSkillName())) {
            for (String prereq : prereqMap.get(skill.getSkillName())) {
                if (skillEnd.containsKey(prereq)) {
                    earliestAfterPrereqs = Math.max(earliestAfterPrereqs, skillEnd.get(prereq) + 1);
                }
            }
        }
        
        // Find earliest slot with no critical tech overlap
        for (int start = earliestAfterPrereqs; start <= totalMonths - duration + 1; start++) {
            boolean canFit = true;
            
            // Check if any month in this range has a critical tech skill
            for (int month = start; month < start + duration && month <= totalMonths; month++) {
                List<String> active = monthActiveSkills.get(month);
                for (String activeSkillName : active) {
                    Blueprint.SkillRequirement activeSkill = skillMap.get(activeSkillName);
                    if (activeSkill != null) {
                        boolean isEssential = "Essential".equalsIgnoreCase(activeSkill.getImportance());
                        boolean isAdvanced = "advanced".equalsIgnoreCase(activeSkill.getDifficulty());
                        boolean isTechnical = "technical".equalsIgnoreCase(normalizeSkillType(activeSkill.getSkillType()));
                        
                        if (isEssential && isAdvanced && isTechnical) {
                            canFit = false;
                            break;
                        }
                    }
                }
                if (!canFit) break;
            }
            
            if (canFit) {
                return start;
            }
        }
        
        return -1; // Cannot schedule
    }
    
    /**
     * Finds earliest start for a skill respecting all constraints
     */
    private int findEarliestStart(Blueprint.SkillRequirement skill,
                                  Map<String, Integer> skillStart,
                                  Map<String, Integer> skillEnd,
                                  Map<String, List<String>> prereqMap,
                                  Map<Integer, List<String>> monthActiveSkills,
                                  int totalMonths, int maxParallel,
                                  boolean checkAdvancedOverlap,
                                  Map<String, Blueprint.SkillRequirement> skillMap) {
        int duration = skill.getTimeRequiredMonths();
        boolean isTechnical = "technical".equalsIgnoreCase(normalizeSkillType(skill.getSkillType()));
        boolean isAdvanced = "advanced".equalsIgnoreCase(skill.getDifficulty());
        
        // Find earliest start respecting prerequisites
        int earliestAfterPrereqs = 1;
        if (prereqMap.containsKey(skill.getSkillName())) {
            for (String prereq : prereqMap.get(skill.getSkillName())) {
                if (skillEnd.containsKey(prereq)) {
                    earliestAfterPrereqs = Math.max(earliestAfterPrereqs, skillEnd.get(prereq) + 1);
                }
            }
        }
        
        // Find earliest slot respecting maxParallel and other constraints
        for (int start = earliestAfterPrereqs; start <= totalMonths - duration + 1; start++) {
            boolean canFit = true;
            
            // Check maxParallel constraint
            for (int month = start; month < start + duration && month <= totalMonths; month++) {
                List<String> active = monthActiveSkills.get(month);
                int effectiveLoad = 0;
                for (String activeSkillName : active) {
                    Blueprint.SkillRequirement activeSkill = skillMap.get(activeSkillName);
                    if (activeSkill != null) {
                        boolean activeIsTechnical = "technical".equalsIgnoreCase(normalizeSkillType(activeSkill.getSkillType()));
                        effectiveLoad += activeIsTechnical ? 1 : 1; // Can adjust weight for non-technical
                    }
                }
                
                // Add this skill's load
                effectiveLoad += isTechnical ? 1 : 1;
                
                if (effectiveLoad > maxParallel) {
                    canFit = false;
                    break;
                }
                
                // Check for advanced technical overlap (soft constraint - warn but allow)
                if (checkAdvancedOverlap && isTechnical && isAdvanced) {
                    for (String activeSkillName : active) {
                        Blueprint.SkillRequirement activeSkill = skillMap.get(activeSkillName);
                        if (activeSkill != null) {
                            boolean activeIsTechnical = "technical".equalsIgnoreCase(normalizeSkillType(activeSkill.getSkillType()));
                            boolean activeIsAdvanced = "advanced".equalsIgnoreCase(activeSkill.getDifficulty());
                            if (activeIsTechnical && activeIsAdvanced) {
                                // Soft constraint violation - allow but will warn later
                            }
                        }
                    }
                }
            }
            
            if (canFit) {
                return start;
            }
        }
        
        return -1; // Cannot schedule
    }
    
    /**
     * Compacts schedule by moving tasks earlier without violating constraints
     */
    private void compactScheduleGreedy(Map<String, Integer> skillStart,
                                       Map<String, Integer> skillEnd,
                                       Map<String, List<String>> prereqMap,
                                       Map<Integer, List<String>> monthActiveSkills,
                                       int totalMonths, int maxParallel,
                                       Map<String, Blueprint.SkillRequirement> skillMap) {
        // Sort skills by current start time
        List<String> sortedSkills = new ArrayList<>(skillStart.keySet());
        sortedSkills.sort(Comparator.comparing(skillStart::get));
        
        // Try to move each skill earlier
        for (String skillName : sortedSkills) {
            Blueprint.SkillRequirement skill = skillMap.get(skillName);
            if (skill == null) continue;
            
            int currentStart = skillStart.get(skillName);
            int duration = skill.getTimeRequiredMonths();
            int currentEnd = skillEnd.get(skillName);
            
            // Find earliest possible start
            int earliestAfterPrereqs = 1;
            if (prereqMap.containsKey(skillName)) {
                for (String prereq : prereqMap.get(skillName)) {
                    if (skillEnd.containsKey(prereq)) {
                        earliestAfterPrereqs = Math.max(earliestAfterPrereqs, skillEnd.get(prereq) + 1);
                    }
                }
            }
            
            // Try to move earlier
            for (int newStart = earliestAfterPrereqs; newStart < currentStart; newStart++) {
                if (canMoveSkillTo(skillName, skill, newStart, skillStart, skillEnd, 
                        monthActiveSkills, totalMonths, maxParallel, skillMap)) {
                    // Move the skill
                    int newEnd = newStart + duration - 1;
                    
                    // Remove from old months
                    for (int month = currentStart; month <= currentEnd; month++) {
                        monthActiveSkills.get(month).remove(skillName);
                    }
                    
                    // Add to new months
                    for (int month = newStart; month <= newEnd; month++) {
                        if (month <= totalMonths) {
                            monthActiveSkills.get(month).add(skillName);
                        }
                    }
                    
                    skillStart.put(skillName, newStart);
                    skillEnd.put(skillName, newEnd);
                    break; // Move as early as possible
                }
            }
        }
    }
    
    /**
     * Checks if a skill can be moved to a new start position
     */
    private boolean canMoveSkillTo(String skillName, Blueprint.SkillRequirement skill,
                                   int newStart, Map<String, Integer> skillStart,
                                   Map<String, Integer> skillEnd,
                                   Map<Integer, List<String>> monthActiveSkills,
                                   int totalMonths, int maxParallel,
                                   Map<String, Blueprint.SkillRequirement> skillMap) {
        int duration = skill.getTimeRequiredMonths();
        boolean isTechnical = "technical".equalsIgnoreCase(normalizeSkillType(skill.getSkillType()));
        boolean isEssential = "Essential".equalsIgnoreCase(skill.getImportance());
        boolean isAdvanced = "advanced".equalsIgnoreCase(skill.getDifficulty());
        boolean isCriticalTech = isEssential && isAdvanced && isTechnical;
        
        // Check bounds
        if (newStart < 1 || newStart + duration - 1 > totalMonths) {
            return false;
        }
        
        // Check prerequisites
        // (Already handled by caller)
        
        // Check constraints for each month
        for (int month = newStart; month < newStart + duration && month <= totalMonths; month++) {
            List<String> active = new ArrayList<>(monthActiveSkills.get(month));
            active.remove(skillName); // Remove this skill from active list (temporarily)
            
            // Check critical tech overlap
            if (isCriticalTech) {
                for (String activeSkillName : active) {
                    Blueprint.SkillRequirement activeSkill = skillMap.get(activeSkillName);
                    if (activeSkill != null) {
                        boolean activeIsEssential = "Essential".equalsIgnoreCase(activeSkill.getImportance());
                        boolean activeIsAdvanced = "advanced".equalsIgnoreCase(activeSkill.getDifficulty());
                        boolean activeIsTechnical = "technical".equalsIgnoreCase(normalizeSkillType(activeSkill.getSkillType()));
                        if (activeIsEssential && activeIsAdvanced && activeIsTechnical) {
                            return false; // Cannot overlap with another critical tech
                        }
                    }
                }
            } else {
                // Check if this month has a critical tech that would conflict
                for (String activeSkillName : active) {
                    Blueprint.SkillRequirement activeSkill = skillMap.get(activeSkillName);
                    if (activeSkill != null) {
                        boolean activeIsEssential = "Essential".equalsIgnoreCase(activeSkill.getImportance());
                        boolean activeIsAdvanced = "advanced".equalsIgnoreCase(activeSkill.getDifficulty());
                        boolean activeIsTechnical = "technical".equalsIgnoreCase(normalizeSkillType(activeSkill.getSkillType()));
                        if (activeIsEssential && activeIsAdvanced && activeIsTechnical) {
                            // This is fine - non-critical can overlap with critical tech
                        }
                    }
                }
            }
            
            // Check maxParallel
            int effectiveLoad = 0;
            for (String activeSkillName : active) {
                Blueprint.SkillRequirement activeSkill = skillMap.get(activeSkillName);
                if (activeSkill != null) {
                    boolean activeIsTechnical = "technical".equalsIgnoreCase(normalizeSkillType(activeSkill.getSkillType()));
                    effectiveLoad += activeIsTechnical ? 1 : 1;
                }
            }
            effectiveLoad += isTechnical ? 1 : 1;
            
            if (effectiveLoad > maxParallel) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Checks for advanced technical overlaps and adds warnings
     */
    private void checkAdvancedTechnicalOverlaps(List<Map<String, Object>> tasks, 
                                               List<String> warnings,
                                               Map<String, Blueprint.SkillRequirement> skillMap) {
        // Build month-to-skills map
        Map<Integer, List<String>> monthSkills = new HashMap<>();
        for (Map<String, Object> task : tasks) {
            String skillName = (String) task.get("name");
            int start = (Integer) task.get("start");
            int end = (Integer) task.get("end");
            for (int month = start; month <= end; month++) {
                monthSkills.computeIfAbsent(month, k -> new ArrayList<>()).add(skillName);
            }
        }
        
        // Check for overlaps
        Set<String> warnedPairs = new HashSet<>();
        for (int month = 1; month <= 24; month++) {
            List<String> skills = monthSkills.get(month);
            if (skills == null || skills.size() < 2) continue;
            
            for (int i = 0; i < skills.size(); i++) {
                for (int j = i + 1; j < skills.size(); j++) {
                    String skill1Name = skills.get(i);
                    String skill2Name = skills.get(j);
                    String pairKey = skill1Name.compareTo(skill2Name) < 0 ? 
                        skill1Name + "|" + skill2Name : skill2Name + "|" + skill1Name;
                    
                    if (warnedPairs.contains(pairKey)) continue;
                    
                    Blueprint.SkillRequirement skill1 = skillMap.get(skill1Name);
                    Blueprint.SkillRequirement skill2 = skillMap.get(skill2Name);
                    
                    if (skill1 != null && skill2 != null) {
                        boolean s1Tech = "technical".equalsIgnoreCase(normalizeSkillType(skill1.getSkillType()));
                        boolean s1Adv = "advanced".equalsIgnoreCase(skill1.getDifficulty());
                        boolean s2Tech = "technical".equalsIgnoreCase(normalizeSkillType(skill2.getSkillType()));
                        boolean s2Adv = "advanced".equalsIgnoreCase(skill2.getDifficulty());
                        
                        // Check if both are advanced technical (but not critical - critical is already prevented)
                        boolean s1Critical = "Essential".equalsIgnoreCase(skill1.getImportance()) && s1Adv;
                        boolean s2Critical = "Essential".equalsIgnoreCase(skill2.getImportance()) && s2Adv;
                        
                        if (s1Tech && s1Adv && s2Tech && s2Adv && !s1Critical && !s2Critical) {
                            warnings.add("Soft preference violation: Advanced technical skills '" + skill1Name + 
                                "' and '" + skill2Name + "' overlap (prefer not to overlap, but allowed).");
                            warnedPairs.add(pairKey);
                        }
                    }
                }
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


