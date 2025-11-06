package com.saarthix.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    public String generateToken(String userId, String email, String userType) {
        Map<String, String> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("userType", userType);
        claims.put("issuedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        claims.put("expiresAt", LocalDateTime.now().plusSeconds(expiration / 1000).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        return createToken(claims);
    }
    
    private String createToken(Map<String, String> claims) {
        try {
            StringBuilder payload = new StringBuilder();
            for (Map.Entry<String, String> entry : claims.entrySet()) {
                payload.append(entry.getKey()).append(":").append(entry.getValue()).append("|");
            }
            
            String payloadStr = payload.toString();
            String signature = generateSignature(payloadStr);
            
            String token = Base64.getEncoder().encodeToString(payloadStr.getBytes(StandardCharsets.UTF_8)) + 
                          "." + Base64.getEncoder().encodeToString(signature.getBytes(StandardCharsets.UTF_8));
            
            return token;
        } catch (Exception e) {
            throw new RuntimeException("Error creating token", e);
        }
    }
    
    private String generateSignature(String payload) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        String data = payload + secret;
        byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hash);
    }
    
    public Boolean validateToken(String token, String userId) {
        try {
            String extractedUserId = extractUserId(token);
            return extractedUserId != null && extractedUserId.equals(userId) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    public String extractUserId(String token) {
        try {
            Map<String, String> claims = extractAllClaims(token);
            return claims.get("userId");
        } catch (Exception e) {
            return null;
        }
    }
    
    public String extractEmail(String token) {
        try {
            Map<String, String> claims = extractAllClaims(token);
            return claims.get("email");
        } catch (Exception e) {
            return null;
        }
    }
    
    public String extractUserType(String token) {
        try {
            Map<String, String> claims = extractAllClaims(token);
            return claims.get("userType");
        } catch (Exception e) {
            return null;
        }
    }
    
    private Map<String, String> extractAllClaims(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 2) {
                throw new RuntimeException("Invalid token format");
            }
            
            String payload = new String(Base64.getDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            String signature = new String(Base64.getDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            
            // Verify signature
            String expectedSignature = generateSignature(payload);
            if (!expectedSignature.equals(signature)) {
                throw new RuntimeException("Invalid token signature");
            }
            
            Map<String, String> claims = new HashMap<>();
            String[] claimPairs = payload.split("\\|");
            for (String pair : claimPairs) {
                if (pair.contains(":")) {
                    String[] keyValue = pair.split(":", 2);
                    claims.put(keyValue[0], keyValue[1]);
                }
            }
            
            return claims;
        } catch (Exception e) {
            throw new RuntimeException("Error parsing token", e);
        }
    }
    
    private Boolean isTokenExpired(String token) {
        try {
            Map<String, String> claims = extractAllClaims(token);
            String expiresAt = claims.get("expiresAt");
            if (expiresAt == null) {
                return true;
            }
            
            LocalDateTime expiration = LocalDateTime.parse(expiresAt, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            return LocalDateTime.now().isAfter(expiration);
        } catch (Exception e) {
            return true;
        }
    }
}
