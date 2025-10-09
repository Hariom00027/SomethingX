package com.careerconnect;

import com.careerconnect.model.ResumeTemplate;
import com.careerconnect.repository.ResumeTemplateRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories(basePackages = "com.careerconnect.repository")
@ComponentScan(basePackages = {"com.careerconnect.controller", "com.careerconnect.config", "com.careerconnect.service", "com.careerconnect.model", "com.careerconnect.repository"})
public class CareerConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareerConnectApplication.class, args);
    }

    @Bean
    ApplicationRunner seedTemplates(ResumeTemplateRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                ResumeTemplate modern = new ResumeTemplate();
                modern.setName("Modern");
                modern.setPreviewUrl("/assets/templates/modern.svg");
                modern.setHtml("<html><body style='font-family:sans-serif;'>" +
                        "<h1>{{fullName}}</h1><h3>{{title}}</h3>" +
                        "<p>{{email}} | {{phone}} | {{location}}</p>" +
                        "<h2>Summary</h2><p>{{summary}}</p>" +
                        "<h2>Skills</h2><p>{{skills}}</p>" +
                        "<h2>Education</h2><p>{{education}}</p>" +
                        "<h2>Experience</h2><p>{{experience}}</p>" +
                        "<h2>Projects</h2><p>{{projects}}</p>" +
                        "</body></html>");

                ResumeTemplate classic = new ResumeTemplate();
                classic.setName("Classic");
                classic.setPreviewUrl("/assets/templates/classic.svg");
                classic.setHtml("<html><body style='font-family:serif;'>" +
                        "<div style='text-align:center'><h1>{{fullName}}</h1><div>{{email}} | {{phone}} | {{location}}</div></div>" +
                        "<h3>Professional Summary</h3><p>{{summary}}</p>" +
                        "<h3>Skills</h3><p>{{skills}}</p>" +
                        "<h3>Education</h3><p>{{education}}</p>" +
                        "<h3>Experience</h3><p>{{experience}}</p>" +
                        "<h3>Projects</h3><p>{{projects}}</p>" +
                        "</body></html>");

                repo.save(modern);
                repo.save(classic);
            }
        };
    }
}
