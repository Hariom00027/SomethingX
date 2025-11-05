package com.careerconnect.service;

import com.careerconnect.model.Training;
import com.careerconnect.repository.TrainingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class TrainingInitializationService implements CommandLineRunner {

    @Autowired
    private TrainingRepository trainingRepository;

    @Override
    public void run(String... args) throws Exception {
        if (trainingRepository.count() > 0) {
            return;
        }
        trainingRepository.saveAll(sampleTrainings());
    }

    private List<Training> sampleTrainings() {
        Training t1 = new Training();
        t1.setRoleName("BMS Engineer");
        t1.setRoleDescription("A Building Management System (BMS) Engineer manages and maintains automation systems that control and monitor building facilities such as HVAC, lighting, and security. The role involves programming, troubleshooting, and ensuring energy-efficient operations.");
        t1.setIndustry("Engineering & Facilities Management");
        t1.setEducationQualification("B.E/B.Tech in Electrical, Electronics, or Mechanical Engineering");
        t1.setTrainingDuration("6 months");
        t1.setTrainingFees(25000);
        t1.setStipendIncluded(true);
        t1.setStipendAmount(8000);
        t1.setAccommodationProvided(false);
        t1.setLocation("Pune, Maharashtra");
        t1.setPackageAfterTraining("4 - 5 LPA");
        t1.setSkillsCovered(Arrays.asList("BMS hardware and software configuration", "PLC & SCADA basics", "HVAC system automation", "Networking and energy monitoring systems"));
        t1.setTrainingMode("Offline");
        t1.setCertificationProvided(true);
        t1.setCertificationName("Certified BMS Engineer");
        t1.setEligibilityCriteria("Final year or graduated students from Electrical or Mechanical background");
        t1.setTrainingProvider("TechInfra Automation Pvt. Ltd.");

        Training t2 = new Training();
        t2.setRoleName("Data Analyst Intern");
        t2.setRoleDescription("The Data Analyst Intern training focuses on helping students understand data collection, cleaning, analysis, and visualization techniques used in the business and tech industry.");
        t2.setIndustry("Information Technology");
        t2.setEducationQualification("Any graduate with basic computer and math skills");
        t2.setTrainingDuration("4 months");
        t2.setTrainingFees(18000);
        t2.setStipendIncluded(true);
        t2.setStipendAmount(5000);
        t2.setAccommodationProvided(false);
        t2.setLocation("Bangalore, Karnataka");
        t2.setPackageAfterTraining("5 - 6 LPA");
        t2.setSkillsCovered(Arrays.asList("Python for data analysis", "Excel & SQL for data management", "Power BI & Tableau visualization", "Basic statistics and business insights"));
        t2.setTrainingMode("Hybrid");
        t2.setCertificationProvided(true);
        t2.setCertificationName("Certified Data Analyst");
        t2.setEligibilityCriteria("Undergraduate students or graduates from any stream");
        t2.setTrainingProvider("DataMinds Analytics Academy");

        Training t3 = new Training();
        t3.setRoleName("Full Stack Developer Trainee");
        t3.setRoleDescription("The Full Stack Developer Trainee program trains candidates in both frontend and backend development using modern frameworks and tools to build scalable web applications.");
        t3.setIndustry("Software Development");
        t3.setEducationQualification("B.Tech/BCA/MCA or equivalent in Computer Science or IT");
        t3.setTrainingDuration("6 months");
        t3.setTrainingFees(30000);
        t3.setStipendIncluded(false);
        t3.setStipendAmount(0);
        t3.setAccommodationProvided(true);
        t3.setLocation("Noida, Uttar Pradesh");
        t3.setPackageAfterTraining("6 - 8 LPA");
        t3.setSkillsCovered(Arrays.asList("HTML, CSS, JavaScript", "React.js and Node.js", "MongoDB and REST APIs", "Version control (Git & GitHub)"));
        t3.setTrainingMode("Offline");
        t3.setCertificationProvided(true);
        t3.setCertificationName("Full Stack Developer Certificate");
        t3.setEligibilityCriteria("Candidates with programming knowledge preferred");
        t3.setTrainingProvider("CodeX Technologies");

        Training t4 = new Training();
        t4.setRoleName("Finance Executive Trainee");
        t4.setRoleDescription("This program helps students gain hands-on experience in financial analysis, budgeting, and accounting principles commonly used in the corporate sector.");
        t4.setIndustry("Finance & Banking");
        t4.setEducationQualification("B.Com, M.Com, BBA, MBA (Finance)");
        t4.setTrainingDuration("3 months");
        t4.setTrainingFees(15000);
        t4.setStipendIncluded(true);
        t4.setStipendAmount(7000);
        t4.setAccommodationProvided(false);
        t4.setLocation("Mumbai, Maharashtra");
        t4.setPackageAfterTraining("4 - 5.5 LPA");
        t4.setSkillsCovered(Arrays.asList("Financial statement analysis", "Excel for finance", "Budgeting and forecasting", "Corporate accounting tools"));
        t4.setTrainingMode("Online");
        t4.setCertificationProvided(true);
        t4.setCertificationName("Finance Executive Certification");
        t4.setEligibilityCriteria("Graduates from commerce or business backgrounds");
        t4.setTrainingProvider("FinEdge Learning Institute");

        Training t5 = new Training();
        t5.setRoleName("Medical Coding Trainee");
        t5.setRoleDescription("This training prepares candidates to translate medical reports into standardized codes used in healthcare billing and data management.");
        t5.setIndustry("Healthcare & Medical");
        t5.setEducationQualification("B.Sc in Life Sciences or Pharmacy");
        t5.setTrainingDuration("4 months");
        t5.setTrainingFees(20000);
        t5.setStipendIncluded(false);
        t5.setStipendAmount(0);
        t5.setAccommodationProvided(true);
        t5.setLocation("Chennai, Tamil Nadu");
        t5.setPackageAfterTraining("3.5 - 4.5 LPA");
        t5.setSkillsCovered(Arrays.asList("ICD-10 & CPT coding standards", "Healthcare billing processes", "HIPAA compliance basics", "Medical terminology"));
        t5.setTrainingMode("Offline");
        t5.setCertificationProvided(true);
        t5.setCertificationName("Certified Medical Coder (CMC)");
        t5.setEligibilityCriteria("Graduates from Life Sciences or Paramedical streams");
        t5.setTrainingProvider("MediTrain Solutions");

        Training t6 = new Training();
        t6.setRoleName("Digital Marketing Trainee");
        t6.setRoleDescription("This training focuses on digital marketing concepts like SEO, social media marketing, content strategy, and analytics to prepare students for marketing roles.");
        t6.setIndustry("Marketing & Media");
        t6.setEducationQualification("Any graduate or undergraduate");
        t6.setTrainingDuration("3 months");
        t6.setTrainingFees(12000);
        t6.setStipendIncluded(true);
        t6.setStipendAmount(4000);
        t6.setAccommodationProvided(false);
        t6.setLocation("Remote (Online)");
        t6.setPackageAfterTraining("3.5 - 4.5 LPA");
        t6.setSkillsCovered(Arrays.asList("SEO & SEM", "Google Ads and Analytics", "Social Media Marketing", "Email Campaigns and Automation"));
        t6.setTrainingMode("Online");
        t6.setCertificationProvided(true);
        t6.setCertificationName("Certified Digital Marketing Professional");
        t6.setEligibilityCriteria("Anyone with interest in marketing and communication");
        t6.setTrainingProvider("AdGrowth Academy");

        return Arrays.asList(t1, t2, t3, t4, t5, t6);
    }
}


