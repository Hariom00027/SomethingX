package com.saarthix.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.List;

@Data
@Document(collection = "expert_sessions")
public class ExpertSession {

    @Id
    private String id;

    private String fullName;
    private String designation;
    private String organization;
    private String baseLocation;
    private String photoUrl;
    private List<String> expertiseDomains;
    private String summary;
    private List<String> sessionFormats; // e.g. Online, Offline, Hybrid
    private List<String> sessionDurations; // e.g. 60 minutes, 90 minutes
    private BigDecimal pricingPerHourOnline;
    private BigDecimal pricingPerHourOffline;
    private List<String> topicsCovered;
    private Integer yearsOfExperience;
    private List<String> languages;
    
    // Allocation fields - determines which user types can access this expert
    private Boolean availableForInstitute = true;
    private Boolean availableForIndustry = true;
}


