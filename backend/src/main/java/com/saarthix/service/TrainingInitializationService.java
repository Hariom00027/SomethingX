package com.saarthix.service;

import com.saarthix.model.Training;
import com.saarthix.repository.TrainingRepository;
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
        // Removed hardcoded training data - trainings should be added through admin interface or database
        // if (trainingRepository.count() > 0) {
        //     return;
        // }
        // trainingRepository.saveAll(sampleTrainings());
    }

    // Removed hardcoded training data - kept method for reference but not used
    @SuppressWarnings("unused")
    private List<Training> sampleTrainings() {
        Training t1 = new Training();
        t1.setRoleName("BMS Engineer");
        t1.setRoleDescription("A Building Management System (BMS) Engineer manages and maintains automation systems that control and monitor building facilities such as HVAC, lighting, and security. The role involves programming, troubleshooting, and ensuring energy-efficient operations.");
        t1.setIndustry("Engineering & Facilities Management");
        t1.setEducationQualification("B.E/B.Tech in Electrical, Electronics, or Mechanical Engineering");
        t1.setTrainingDuration("6 months");
        t1.setTrainingFees(25000);
        t1.setInstituteTrainingFees(220000);
        t1.setTotalStudentsAllowed(40);
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
        t1.setDayOneReady(true);
        t1.setDayOneSummary("Certified to operate BMS consoles, respond to alerts, and log incidents from day one.");
        t1.setDayOneDeliverables(Arrays.asList(
                "Perform daily system health checks",
                "Respond to HVAC and safety alerts within 15 minutes",
                "Log and escalate incidents following SOPs"
        ));

        Training t2 = new Training();
        t2.setRoleName("Data Analyst Intern");
        t2.setRoleDescription("The Data Analyst Intern training focuses on helping students understand data collection, cleaning, analysis, and visualization techniques used in the business and tech industry.");
        t2.setIndustry("Information Technology");
        t2.setEducationQualification("Any graduate with basic computer and math skills");
        t2.setTrainingDuration("4 months");
        t2.setTrainingFees(18000);
        t2.setInstituteTrainingFees(160000);
        t2.setTotalStudentsAllowed(30);
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
        t2.setDayOneReady(true);
        t2.setDayOneSummary("Ready to pull data, build dashboards, and deliver daily metrics updates.");
        t2.setDayOneDeliverables(Arrays.asList(
                "Publish a daily KPI dashboard refresh",
                "Write parameterized SQL queries for ad-hoc asks",
                "Present findings with clear narrative decks"
        ));

        Training t3 = new Training();
        t3.setRoleName("Full Stack Developer Trainee");
        t3.setRoleDescription("The Full Stack Developer Trainee program trains candidates in both frontend and backend development using modern frameworks and tools to build scalable web applications.");
        t3.setIndustry("Software Development");
        t3.setEducationQualification("B.Tech/BCA/MCA or equivalent in Computer Science or IT");
        t3.setTrainingDuration("6 months");
        t3.setTrainingFees(30000);
        t3.setInstituteTrainingFees(270000);
        t3.setTotalStudentsAllowed(35);
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
        t3.setDayOneReady(true);
        t3.setDayOneSummary("Capable of shipping features and resolving production bugs on day one.");
        t3.setDayOneDeliverables(Arrays.asList(
                "Pick up a scoped user story and deliver in Git-based workflow",
                "Fix priority-2 bugs with automated tests",
                "Deploy updates through CI/CD pipeline"
        ));

        Training t4 = new Training();
        t4.setRoleName("Finance Executive Trainee");
        t4.setRoleDescription("This program helps students gain hands-on experience in financial analysis, budgeting, and accounting principles commonly used in the corporate sector.");
        t4.setIndustry("Finance & Banking");
        t4.setEducationQualification("B.Com, M.Com, BBA, MBA (Finance)");
        t4.setTrainingDuration("3 months");
        t4.setTrainingFees(15000);
        t4.setInstituteTrainingFees(140000);
        t4.setTotalStudentsAllowed(25);
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
        t4.setDayOneReady(true);
        t4.setDayOneSummary("Ready to close books, process invoices, and reconcile ledgers from day one.");
        t4.setDayOneDeliverables(Arrays.asList(
                "Process 30+ invoices with 100% accuracy",
                "Prepare GST filings and compliance schedules",
                "Reconcile ledgers using SAP FICO workflows"
        ));

        Training t5 = new Training();
        t5.setRoleName("Medical Coding Trainee");
        t5.setRoleDescription("This training prepares candidates to translate medical reports into standardized codes used in healthcare billing and data management.");
        t5.setIndustry("Healthcare & Medical");
        t5.setEducationQualification("B.Sc in Life Sciences or Pharmacy");
        t5.setTrainingDuration("4 months");
        t5.setTrainingFees(20000);
        t5.setInstituteTrainingFees(180000);
        t5.setTotalStudentsAllowed(30);
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
        t5.setDayOneReady(true);
        t5.setDayOneSummary("CPC exam-aligned coders who can clear 25+ charts per shift with quality benchmarks.");
        t5.setDayOneDeliverables(Arrays.asList(
                "Code outpatient charts with 98% accuracy",
                "Flag documentation gaps to physicians",
                "Meet HIPAA compliance procedures"
        ));

        Training t6 = new Training();
        t6.setRoleName("Digital Marketing Trainee");
        t6.setRoleDescription("This training focuses on digital marketing concepts like SEO, social media marketing, content strategy, and analytics to prepare students for marketing roles.");
        t6.setIndustry("Marketing & Media");
        t6.setEducationQualification("Any graduate or undergraduate");
        t6.setTrainingDuration("3 months");
        t6.setTrainingFees(12000);
        t6.setInstituteTrainingFees(100000);
        t6.setTotalStudentsAllowed(50);
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
        t6.setDayOneReady(true);
        t6.setDayOneSummary("Ready to manage paid and organic campaigns with weekly performance reporting.");
        t6.setDayOneDeliverables(Arrays.asList(
                "Launch and monitor Meta ad campaigns",
                "Ship SEO content calendars and on-page optimizations",
                "Deliver weekly campaign analytics report"
        ));

        Training t7 = new Training();
        t7.setRoleName("Salesforce SDR Accelerator");
        t7.setRoleDescription("Intensive program to prepare SDRs for Salesforce-centric lead generation and pipeline nurturing.");
        t7.setIndustry("SaaS Sales");
        t7.setEducationQualification("Any Graduate with strong communication");
        t7.setTrainingDuration("8 Weeks");
        t7.setTrainingFees(0);
        t7.setInstituteTrainingFees(250000);
        t7.setTotalStudentsAllowed(20);
        t7.setStipendIncluded(false);
        t7.setStipendAmount(0);
        t7.setAccommodationProvided(false);
        t7.setLocation("Remote");
        t7.setPackageAfterTraining("₹5.8 LPA");
        t7.setSkillsCovered(Arrays.asList(
                "Salesforce CRM",
                "Outbound Sequencing",
                "Cold Calling & Emailing",
                "Lead Qualification Frameworks",
                "Demo Scheduling"
        ));
        t7.setTrainingMode("Online");
        t7.setCertificationProvided(true);
        t7.setCertificationName("Certified SDR Professional");
        t7.setEligibilityCriteria("Graduates with fluent English communication skills.");
        t7.setTrainingProvider("SaarthiX Revenue Academy");
        t7.setDayOneReady(true);
        t7.setDayOneSummary("SDRs can hit daily outreach targets and deliver SQLs from day one.");
        t7.setDayOneDeliverables(Arrays.asList(
                "Execute 60+ personalized outbound touches",
                "Maintain CRM hygiene with opportunity notes",
                "Book qualified discovery calls for AEs"
        ));

        Training t8 = new Training();
        t8.setRoleName("Product Support Engineer Launchpad");
        t8.setRoleDescription("Prepares engineers to troubleshoot SaaS products, resolve tickets, and manage on-call rotations.");
        t8.setIndustry("Customer Support");
        t8.setEducationQualification("B.Tech/B.Sc in Computer Science or equivalent");
        t8.setTrainingDuration("10 Weeks");
        t8.setTrainingFees(0);
        t8.setInstituteTrainingFees(280000);
        t8.setTotalStudentsAllowed(18);
        t8.setStipendIncluded(false);
        t8.setStipendAmount(0);
        t8.setAccommodationProvided(false);
        t8.setLocation("Pune");
        t8.setPackageAfterTraining("₹6.2 LPA");
        t8.setSkillsCovered(Arrays.asList(
                "SaaS Product Debugging",
                "SQL & Log Analysis",
                "Customer Communication",
                "Postman & API Troubleshooting",
                "Incident Management"
        ));
        t8.setTrainingMode("Hybrid");
        t8.setCertificationProvided(true);
        t8.setCertificationName("Certified Product Support Engineer");
        t8.setEligibilityCriteria("Fresh graduates comfortable with scripting and debugging.");
        t8.setTrainingProvider("SaarthiX Support Guild");
        t8.setDayOneReady(true);
        t8.setDayOneSummary("Engineers can resolve L1 tickets, triage incidents, and maintain SLAs on day one.");
        t8.setDayOneDeliverables(Arrays.asList(
                "Resolve 15+ L1 tickets per shift with CSAT > 4.5",
                "Escalate P1 incidents with full reproduction steps",
                "Publish daily shift handover notes"
        ));

        return Arrays.asList(t1, t2, t3, t4, t5, t6, t7, t8);
    }
}


