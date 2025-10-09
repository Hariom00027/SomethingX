package com.careerconnect.service.blueprint;

import com.careerconnect.model.blueprint.Blueprint;
import com.careerconnect.model.User;
import com.careerconnect.repository.blueprint.BlueprintRepository;
import com.careerconnect.repository.UserRepository;
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
        
        // Create timeline labels
        List<String> labels = new ArrayList<>();
        for (int i = 1; i <= totalMonths; i++) {
            labels.add("Month " + i);
        }
        
        // Create skill development tasks based on skill requirements
        List<Map<String, Object>> tasks = new ArrayList<>();
        
        // Use new skill requirements if available, otherwise fall back to old structure
        if (roleDetails.getSkillRequirements() != null && !roleDetails.getSkillRequirements().isEmpty()) {
            // New approach: Use skill requirements with time data
            int currentMonth = 1;
            
            for (Blueprint.SkillRequirement skillReq : roleDetails.getSkillRequirements()) {
                int skillDuration = Math.min(skillReq.getTimeRequiredMonths(), totalMonths - currentMonth + 1);
                if (skillDuration <= 0) break;
                
                int endMonth = Math.min(currentMonth + skillDuration - 1, totalMonths);
                
                Map<String, Object> task = new HashMap<>();
                task.put("id", "skill_" + skillReq.getSkillName().replaceAll("\\s+", "_"));
                task.put("name", skillReq.getSkillName());
                task.put("start", currentMonth);
                task.put("end", endMonth);
                task.put("type", skillReq.getSkillType());
                task.put("difficulty", skillReq.getDifficulty());
                task.put("description", skillReq.getDescription());
                task.put("timeRequired", skillReq.getTimeRequiredMonths());
                task.put("progress", 0);
                tasks.add(task);
                
                currentMonth = endMonth + 1;
                if (currentMonth > totalMonths) break;
            }
        } else {
            // Fallback to old structure for backward compatibility
            List<String> technicalSkills = roleDetails.getSkills() != null ? roleDetails.getSkills().get("technical") : null;
            if (technicalSkills != null) {
                for (int i = 0; i < technicalSkills.size(); i++) {
                    String skill = technicalSkills.get(i);
                    int startMonth = (i * totalMonths) / technicalSkills.size() + 1;
                    int duration = Math.max(2, totalMonths / technicalSkills.size());
                    int endMonth = Math.min(startMonth + duration - 1, totalMonths);
                    
                    Map<String, Object> task = new HashMap<>();
                    task.put("id", "tech_" + i);
                    task.put("name", skill);
                    task.put("start", startMonth);
                    task.put("end", endMonth);
                    task.put("type", "technical");
                    task.put("progress", 0);
                    tasks.add(task);
                }
            }
            
            List<String> softSkills = roleDetails.getSkills() != null ? roleDetails.getSkills().get("soft") : null;
            if (softSkills != null) {
                for (int i = 0; i < softSkills.size(); i++) {
                    String skill = softSkills.get(i);
                    int startMonth = (i * totalMonths) / softSkills.size() + 1;
                    int duration = Math.max(2, totalMonths / softSkills.size());
                    int endMonth = Math.min(startMonth + duration - 1, totalMonths);
                    
                    Map<String, Object> task = new HashMap<>();
                    task.put("id", "soft_" + i);
                    task.put("name", skill);
                    task.put("start", startMonth);
                    task.put("end", endMonth);
                    task.put("type", "soft");
                    task.put("progress", 0);
                    tasks.add(task);
                }
            }
        }
        
        // Add project/internship phases
        Map<String, Object> projectPhase = new HashMap<>();
        projectPhase.put("id", "project_phase");
        projectPhase.put("name", "Projects & Internships");
        projectPhase.put("start", Math.max(1, totalMonths - 6));
        projectPhase.put("end", totalMonths);
        projectPhase.put("type", "project");
        projectPhase.put("progress", 0);
        tasks.add(projectPhase);
        
        ganttData.put("labels", labels);
        ganttData.put("tasks", tasks);
        ganttData.put("totalMonths", totalMonths);
        ganttData.put("chartType", "gantt");
        
        return ganttData;
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

    public boolean mapIndustryToInstitute(String industryName, String instituteName) {
        try {
            // Find the industry
            Optional<Blueprint> industryOpt = blueprintRepository.findByNameAndType(industryName, "industry");
            if (industryOpt.isEmpty()) {
                return false;
            }

            // Find or create institute
            Optional<Blueprint> instituteOpt = blueprintRepository.findByNameAndType(instituteName, "institute");
            Blueprint institute;
            
            if (instituteOpt.isEmpty()) {
                // Create new institute
                institute = new Blueprint();
                institute.setType("institute");
                institute.setName(instituteName);
                institute.setActive(true);
                institute.setCreatedBy("admin");
                institute.setLastModifiedBy("admin");
            } else {
                institute = instituteOpt.get();
            }
            
            // Add industry to institute's industries list if not already present
            if (institute.getIndustries() == null) {
                institute.setIndustries(new ArrayList<>());
            }
            if (!institute.getIndustries().contains(industryName)) {
                institute.getIndustries().add(industryName);
                blueprintRepository.save(institute);
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


