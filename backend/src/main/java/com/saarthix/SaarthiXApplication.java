package com.saarthix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories(basePackages = "com.saarthix.repository")
@ComponentScan(basePackages = {"com.saarthix"})
public class SaarthiXApplication {

    public static void main(String[] args) {
        SpringApplication.run(SaarthiXApplication.class, args);
    }

}
