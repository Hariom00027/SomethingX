package com.careerconnect.model.blueprint;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Document(collection = "blueprints")
public class Blueprint {

    @Id
    private String id; // maps to _id

    private String type; // "industry", "education", "role"

    private String name; // map DB 'title' -> model 'name'

    private List<String> roles;

    private List<String> specializations; // may be null for many docs

    private List<String> educations; // map DB 'education' -> model 'educations'

    private List<String> industries; // for institute docs: list of industries

    private Map<String, String> jobDescription; // optional, may be null

    private Map<String, List<String>> skills; // for role docs: {description:String, technical:[], soft:[]}

    private Map<String, Object> plan; // map DB 'datasets' -> model 'plan'

    // New fields for skills and time management
    private List<SkillRequirement> skillRequirements; // Skills with time requirements
    
    private String description; // Description of the blueprint
    
    private String category; // Category for organization
    
    private boolean isActive; // Whether this blueprint is active
    
    private String createdBy; // Admin who created this blueprint
    
    private String lastModifiedBy; // Admin who last modified this blueprint

    // Inner class for skill requirements
    public static class SkillRequirement {
        private String skillName;
        private String skillType; // "technical", "soft", "certification"
        private int timeRequiredMonths; // Time required to master this skill
        private String difficulty; // "beginner", "intermediate", "advanced"
        private String description; // Description of the skill
        private List<String> prerequisites; // Skills that should be learned before this
        
        public SkillRequirement() {}
        
        public SkillRequirement(String skillName, String skillType, int timeRequiredMonths, 
                              String difficulty, String description, List<String> prerequisites) {
            this.skillName = skillName;
            this.skillType = skillType;
            this.timeRequiredMonths = timeRequiredMonths;
            this.difficulty = difficulty;
            this.description = description;
            this.prerequisites = prerequisites;
        }
        
        // Getters and setters
        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }
        
        public String getSkillType() { return skillType; }
        public void setSkillType(String skillType) { this.skillType = skillType; }
        
        public int getTimeRequiredMonths() { return timeRequiredMonths; }
        public void setTimeRequiredMonths(int timeRequiredMonths) { this.timeRequiredMonths = timeRequiredMonths; }
        
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public List<String> getPrerequisites() { return prerequisites; }
        public void setPrerequisites(List<String> prerequisites) { this.prerequisites = prerequisites; }
    }

    // Default constructor
    public Blueprint() {}

    public Blueprint(String type, String name, List<String> roles, List<String> specializations,
                     List<String> educations, Map<String, String> jobDescription,
                     Map<String, List<String>> skills, Map<String, Object> plan) {
        this.type = type;
        this.name = name;
        this.roles = roles;
        this.specializations = specializations;
        this.educations = educations;
        this.jobDescription = jobDescription;
        this.skills = skills;
        this.plan = plan;
        this.isActive = true;
    }
    
    // New constructor for admin-created blueprints
    public Blueprint(String type, String name, String description, String category,
                     List<SkillRequirement> skillRequirements, String createdBy) {
        this.type = type;
        this.name = name;
        this.description = description;
        this.category = category;
        this.skillRequirements = skillRequirements;
        this.createdBy = createdBy;
        this.lastModifiedBy = createdBy;
        this.isActive = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public List<String> getSpecializations() { return specializations; }
    public void setSpecializations(List<String> specializations) { this.specializations = specializations; }

    public List<String> getEducations() { return educations; }
    public void setEducations(List<String> educations) { this.educations = educations; }

    public List<String> getIndustries() { return industries; }
    public void setIndustries(List<String> industries) { this.industries = industries; }

    public Map<String, String> getJobDescription() { return jobDescription; }
    public void setJobDescription(Map<String, String> jobDescription) { this.jobDescription = jobDescription; }

    public Map<String, List<String>> getSkills() { return skills; }
    public void setSkills(Map<String, List<String>> skills) { this.skills = skills; }

    public Map<String, Object> getPlan() { return plan; }
    public void setPlan(Map<String, Object> plan) { this.plan = plan; }

    // New getters and setters
    public List<SkillRequirement> getSkillRequirements() { return skillRequirements; }
    public void setSkillRequirements(List<SkillRequirement> skillRequirements) { this.skillRequirements = skillRequirements; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public String getLastModifiedBy() { return lastModifiedBy; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }

    @Override
    public String toString() {
        return "Blueprint{" +
                "id='" + id + '\'' +
                ", type='" + type + '\'' +
                ", name='" + name + '\'' +
                ", roles=" + roles +
                ", specializations=" + specializations +
                ", educations=" + educations +
                ", jobDescription=" + jobDescription +
                ", skills=" + skills +
                ", plan=" + plan +
                ", skillRequirements=" + skillRequirements +
                ", description='" + description + '\'' +
                ", category='" + category + '\'' +
                ", isActive=" + isActive +
                ", createdBy='" + createdBy + '\'' +
                ", lastModifiedBy='" + lastModifiedBy + '\'' +
                '}';
    }
}


