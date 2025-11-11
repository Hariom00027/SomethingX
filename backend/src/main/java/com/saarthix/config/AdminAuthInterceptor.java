package com.saarthix.config;

import com.saarthix.model.User;
import com.saarthix.repository.UserRepository;
import com.saarthix.service.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AdminAuthInterceptor implements HandlerInterceptor {
    
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Skip for OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized: Missing or invalid token\"}");
            return false;
        }
        
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String userId = jwtUtil.extractUserId(token);
            
            if (userId == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized: Invalid token\"}");
                return false;
            }
            
            // Validate token
            if (!jwtUtil.validateToken(token, userId)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized: Token expired or invalid\"}");
                return false;
            }
            
            // Check if user exists and has ADMIN role
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized: User not found\"}");
                return false;
            }
            
            User user = userOpt.get();
            if (user.getRoles() == null || !user.getRoles().contains("ADMIN")) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Forbidden: Admin access required\"}");
                return false;
            }
            
            return true;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized: " + e.getMessage() + "\"}");
            return false;
        }
    }
}

