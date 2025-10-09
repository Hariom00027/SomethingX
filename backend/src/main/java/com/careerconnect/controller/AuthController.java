package com.careerconnect.controller;

import com.careerconnect.model.User;
import com.careerconnect.service.AuthService;
import com.careerconnect.service.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String googleId = loginRequest.get("googleId");
        String email = loginRequest.get("email");
        String name = loginRequest.get("name");
        String picture = loginRequest.get("picture");
        
        User user = authService.createOrUpdateUser(googleId, email, name, picture);
        String token = authService.generateToken(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", token);
        response.put("user", user);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String userId = jwtUtil.extractUserId(token);
            
            Optional<User> user = authService.getUserById(userId);
            return user.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestHeader("Authorization") String authHeader,
                                            @RequestBody User updatedUser) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String userId = jwtUtil.extractUserId(token);
            
            User user = authService.updateUserProfile(userId, updatedUser);
            return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String userId = jwtUtil.extractUserId(token);
            String email = jwtUtil.extractEmail(token);
            String userType = jwtUtil.extractUserType(token);
            
            boolean isValid = jwtUtil.validateToken(token, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", isValid);
            if (isValid) {
                response.put("userId", userId);
                response.put("email", email);
                response.put("userType", userType);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("error", "Invalid token");
            return ResponseEntity.ok(response);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
}
