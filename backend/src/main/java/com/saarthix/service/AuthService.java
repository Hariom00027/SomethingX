package com.saarthix.service;

import com.saarthix.model.User;
import com.saarthix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    
    public User createOrUpdateUser(String googleId, String email, String name, String picture) {
        Optional<User> existingUser = userRepository.findByGoogleId(googleId);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setName(name);
            user.setPicture(picture);
            user.setLastLoginAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        
        // Check if user exists with same email
        Optional<User> userByEmail = userRepository.findByEmail(email);
        if (userByEmail.isPresent()) {
            User user = userByEmail.get();
            user.setGoogleId(googleId);
            user.setName(name);
            user.setPicture(picture);
            user.setLastLoginAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        
        // Create new user
        User newUser = new User();
        newUser.setGoogleId(googleId);
        newUser.setEmail(email);
        newUser.setName(name);
        newUser.setPicture(picture);
        newUser.setRoles(Set.of("USER"));
        newUser.setUserType("STUDENT"); // Default user type
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setLastLoginAt(LocalDateTime.now());
        newUser.setActive(true);
        
        // Extract first and last name
        String[] nameParts = name.split(" ");
        if (nameParts.length > 0) {
            newUser.setFirstName(nameParts[0]);
        }
        if (nameParts.length > 1) {
            newUser.setLastName(nameParts[nameParts.length - 1]);
        }
        
        return userRepository.save(newUser);
    }
    
    public String generateToken(User user) {
        return jwtUtil.generateToken(user.getId(), user.getEmail(), user.getUserType());
    }
    
    public Optional<User> getUserById(String userId) {
        return userRepository.findById(userId);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public User updateUserProfile(String userId, User updatedUser) {
        Optional<User> existingUser = userRepository.findById(userId);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            
            // Update allowed fields
            if (updatedUser.getPhone() != null) {
                user.setPhone(updatedUser.getPhone());
            }
            if (updatedUser.getLocation() != null) {
                user.setLocation(updatedUser.getLocation());
            }
            if (updatedUser.getBio() != null) {
                user.setBio(updatedUser.getBio());
            }
            if (updatedUser.getLinkedinUrl() != null) {
                user.setLinkedinUrl(updatedUser.getLinkedinUrl());
            }
            if (updatedUser.getGithubUrl() != null) {
                user.setGithubUrl(updatedUser.getGithubUrl());
            }
            if (updatedUser.getUserType() != null) {
                user.setUserType(updatedUser.getUserType());
            }
            
            // Institute specific fields
            if (updatedUser.getInstituteName() != null) {
                user.setInstituteName(updatedUser.getInstituteName());
            }
            if (updatedUser.getInstituteType() != null) {
                user.setInstituteType(updatedUser.getInstituteType());
            }
            if (updatedUser.getInstituteLocation() != null) {
                user.setInstituteLocation(updatedUser.getInstituteLocation());
            }
            
            // Industry specific fields
            if (updatedUser.getCompanyName() != null) {
                user.setCompanyName(updatedUser.getCompanyName());
            }
            if (updatedUser.getCompanyType() != null) {
                user.setCompanyType(updatedUser.getCompanyType());
            }
            if (updatedUser.getIndustry() != null) {
                user.setIndustry(updatedUser.getIndustry());
            }
            if (updatedUser.getPosition() != null) {
                user.setPosition(updatedUser.getPosition());
            }
            
            // Student specific fields
            if (updatedUser.getCourse() != null) {
                user.setCourse(updatedUser.getCourse());
            }
            if (updatedUser.getStream() != null) {
                user.setStream(updatedUser.getStream());
            }
            if (updatedUser.getSpecialization() != null) {
                user.setSpecialization(updatedUser.getSpecialization());
            }
            if (updatedUser.getYear() != null) {
                user.setYear(updatedUser.getYear());
            }
            if (updatedUser.getSemester() != null) {
                user.setSemester(updatedUser.getSemester());
            }
            if (updatedUser.getStudentId() != null) {
                user.setStudentId(updatedUser.getStudentId());
            }
            if (updatedUser.getBatch() != null) {
                user.setBatch(updatedUser.getBatch());
            }
            if (updatedUser.getCgpa() != null) {
                user.setCgpa(updatedUser.getCgpa());
            }
            if (updatedUser.getExpectedGraduationYear() != null) {
                user.setExpectedGraduationYear(updatedUser.getExpectedGraduationYear());
            }
            if (updatedUser.getSkills() != null) {
                user.setSkills(updatedUser.getSkills());
            }
            if (updatedUser.getInterests() != null) {
                user.setInterests(updatedUser.getInterests());
            }
            if (updatedUser.getAchievements() != null) {
                user.setAchievements(updatedUser.getAchievements());
            }
            if (updatedUser.getProjects() != null) {
                user.setProjects(updatedUser.getProjects());
            }
            if (updatedUser.getCertifications() != null) {
                user.setCertifications(updatedUser.getCertifications());
            }
            if (updatedUser.getLanguages() != null) {
                user.setLanguages(updatedUser.getLanguages());
            }
            if (updatedUser.getResumeUrl() != null) {
                user.setResumeUrl(updatedUser.getResumeUrl());
            }
            if (updatedUser.getPortfolioUrl() != null) {
                user.setPortfolioUrl(updatedUser.getPortfolioUrl());
            }
            
            return userRepository.save(user);
        }
        return null;
    }
}
