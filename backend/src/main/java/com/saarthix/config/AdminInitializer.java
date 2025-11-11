package com.saarthix.config;

import com.saarthix.model.User;
import com.saarthix.repository.UserRepository;
import com.saarthix.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final AuthService authService;
    
    private static final String ADMIN_USERNAME = "ADMIN";
    private static final String ADMIN_PASSWORD = "Admin@221105";
    
    @Override
    public void run(String... args) throws Exception {
        // Check if admin user exists
        if (!userRepository.existsByUsername(ADMIN_USERNAME)) {
            // Create admin user
            User adminUser = new User();
            adminUser.setUsername(ADMIN_USERNAME);
            adminUser.setPassword(authService.hashPassword(ADMIN_PASSWORD));
            adminUser.setEmail("admin@saarthix.com");
            adminUser.setName("Admin User");
            adminUser.setRoles(Set.of("ADMIN", "USER"));
            adminUser.setUserType("ADMIN");
            adminUser.setActive(true);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setLastLoginAt(LocalDateTime.now());
            
            userRepository.save(adminUser);
            System.out.println("Admin user created successfully with username: " + ADMIN_USERNAME);
        } else {
            // Update admin password if it exists (in case password needs to be reset)
            userRepository.findByUsername(ADMIN_USERNAME).ifPresent(adminUser -> {
                // Only update if password is not set or needs to be reset
                if (adminUser.getPassword() == null || adminUser.getPassword().isEmpty()) {
                    adminUser.setPassword(authService.hashPassword(ADMIN_PASSWORD));
                    adminUser.setRoles(Set.of("ADMIN", "USER"));
                    adminUser.setUserType("ADMIN");
                    adminUser.setActive(true);
                    userRepository.save(adminUser);
                    System.out.println("Admin user password updated successfully");
                }
            });
        }
    }
}

