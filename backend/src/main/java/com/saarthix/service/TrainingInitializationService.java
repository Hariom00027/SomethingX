package com.saarthix.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.saarthix.model.Training;
import com.saarthix.repository.TrainingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Service
public class TrainingInitializationService implements CommandLineRunner {

    @Autowired
    private TrainingRepository trainingRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        initializeTrainings();
    }

    private void initializeTrainings() {
        try {
            // Skip if trainings already exist in database
            if (trainingRepository.count() > 0) {
                System.out.println("Trainings already exist in database. Skipping initialization.");
                return;
            }

            // Try to load training data from JSON file
            ClassPathResource resource = new ClassPathResource("training-data.json");
            if (!resource.exists()) {
                System.out.println("training-data.json not found. Skipping training initialization.");
                return;
            }

            InputStream inputStream = resource.getInputStream();
            List<Map<String, Object>> trainingDataList = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<Map<String, Object>>>() {}
            );

            // Process each training from JSON
            for (Map<String, Object> trainingData : trainingDataList) {
                Training training = new Training();

                // Set all fields from JSON data
                training.setId((String) trainingData.get("id"));
                training.setRoleName((String) trainingData.get("roleName"));
                training.setRoleDescription((String) trainingData.get("roleDescription"));
                training.setIndustry((String) trainingData.get("industry"));
                training.setEducationQualification((String) trainingData.get("educationQualification"));
                training.setTrainingDuration((String) trainingData.get("trainingDuration"));
                
                // Handle integer fields
                if (trainingData.get("trainingFees") != null) {
                    training.setTrainingFees(((Number) trainingData.get("trainingFees")).intValue());
                }
                if (trainingData.get("instituteTrainingFees") != null) {
                    training.setInstituteTrainingFees(((Number) trainingData.get("instituteTrainingFees")).intValue());
                }
                if (trainingData.get("totalStudentsAllowed") != null) {
                    training.setTotalStudentsAllowed(((Number) trainingData.get("totalStudentsAllowed")).intValue());
                }
                if (trainingData.get("stipendAmount") != null) {
                    training.setStipendAmount(((Number) trainingData.get("stipendAmount")).intValue());
                }
                
                // Handle boolean fields
                training.setStipendIncluded(trainingData.get("stipendIncluded") != null ? 
                    (Boolean) trainingData.get("stipendIncluded") : false);
                training.setAccommodationProvided(trainingData.get("accommodationProvided") != null ? 
                    (Boolean) trainingData.get("accommodationProvided") : false);
                training.setCertificationProvided(trainingData.get("certificationProvided") != null ? 
                    (Boolean) trainingData.get("certificationProvided") : false);
                training.setDayOneReady(trainingData.get("dayOneReady") != null ? 
                    (Boolean) trainingData.get("dayOneReady") : false);
                
                training.setLocation((String) trainingData.get("location"));
                training.setPackageAfterTraining((String) trainingData.get("packageAfterTraining"));
                
                // Handle lists
                @SuppressWarnings("unchecked")
                List<String> skillsCovered = (List<String>) trainingData.get("skillsCovered");
                training.setSkillsCovered(skillsCovered);
                
                @SuppressWarnings("unchecked")
                List<String> dayOneDeliverables = (List<String>) trainingData.get("dayOneDeliverables");
                training.setDayOneDeliverables(dayOneDeliverables);
                
                training.setTrainingMode((String) trainingData.get("trainingMode"));
                training.setCertificationName((String) trainingData.get("certificationName"));
                training.setEligibilityCriteria((String) trainingData.get("eligibilityCriteria"));
                training.setTrainingProvider((String) trainingData.get("trainingProvider"));
                training.setDayOneSummary((String) trainingData.get("dayOneSummary"));

                trainingRepository.save(training);
                System.out.println("Loaded training: " + training.getRoleName());
            }

            System.out.println("Training initialization completed. Total trainings: " + trainingRepository.count());
        } catch (Exception e) {
            System.err.println("Error initializing trainings: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
