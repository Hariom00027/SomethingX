package com.saarthix.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "trainings")
public class Training {

    @Id
    private String id;

    private String roleName;
    private String roleDescription;
    private String industry;
    private String educationQualification;
    private String trainingDuration;
    private int trainingFees;
    private int instituteTrainingFees;
    private int totalStudentsAllowed;
    private boolean stipendIncluded;
    private int stipendAmount;
    private boolean accommodationProvided;
    private String location;
    private String packageAfterTraining;
    private List<String> skillsCovered;
    private String trainingMode; // Online / Offline / Hybrid
    private boolean certificationProvided;
    private String certificationName;
    private String eligibilityCriteria;
    private String trainingProvider;

    private boolean dayOneReady;
    private String dayOneSummary;
    private List<String> dayOneDeliverables;
}


