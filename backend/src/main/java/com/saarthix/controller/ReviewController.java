package com.saarthix.controller;

import com.saarthix.model.ReviewRequest;
import com.saarthix.model.Resume;
import com.saarthix.repository.ReviewRequestRepository;
import com.saarthix.repository.ResumeRepository;
import com.saarthix.service.OpenAIService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewRequestRepository reviewRepository;
    private final ResumeRepository resumeRepository;
    private final OpenAIService openAIService;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<?> request(@RequestBody ReviewRequest req) {
        req.setRequestedAt(Instant.now());
        
        // Ensure studentId is set from resume if not provided
        if (req.getStudentId() == null || req.getStudentId().isEmpty()) {
            Resume resume = resumeRepository.findById(req.getResumeId())
                    .orElse(null);
            if (resume != null && resume.getStudentId() != null) {
                req.setStudentId(resume.getStudentId());
            }
        }
        
        // Handle AI review - process immediately
        if ("AI".equals(req.getType())) {
            try {
                Resume resume = resumeRepository.findById(req.getResumeId())
                        .orElseThrow(() -> new RuntimeException("Resume not found"));
                
                // Generate AI review
                String aiResponse = openAIService.reviewResume(resume);
                
                // Parse JSON response
                try {
                    JsonNode jsonNode = objectMapper.readTree(aiResponse);
                    
                    // Extract structured data
                    if (jsonNode.has("rating")) {
                        req.setRating(jsonNode.get("rating").asInt());
                    }
                    if (jsonNode.has("review")) {
                        req.setReview(jsonNode.get("review").asText());
                    }
                    if (jsonNode.has("suggestions")) {
                        List<String> suggestionsList = new ArrayList<>();
                        jsonNode.get("suggestions").forEach(node -> suggestionsList.add(node.asText()));
                        req.setSuggestions(String.join("\n• ", suggestionsList));
                        if (!req.getSuggestions().isEmpty()) {
                            req.setSuggestions("• " + req.getSuggestions());
                        }
                    }
                    if (jsonNode.has("strengths")) {
                        List<String> strengthsList = new ArrayList<>();
                        jsonNode.get("strengths").forEach(node -> strengthsList.add(node.asText()));
                        String strengths = String.join("\n• ", strengthsList);
                        if (!strengths.isEmpty()) {
                            strengths = "• " + strengths;
                        }
                        // Store strengths in feedback field
                        req.setFeedback("Strengths:\n" + strengths);
                    }
                    if (jsonNode.has("weaknesses")) {
                        List<String> weaknessesList = new ArrayList<>();
                        jsonNode.get("weaknesses").forEach(node -> weaknessesList.add(node.asText()));
                        String weaknesses = String.join("\n• ", weaknessesList);
                        if (!weaknesses.isEmpty()) {
                            weaknesses = "• " + weaknesses;
                        }
                        // Append weaknesses to feedback
                        if (req.getFeedback() != null && !req.getFeedback().isEmpty()) {
                            req.setFeedback(req.getFeedback() + "\n\nWeaknesses:\n" + weaknesses);
                        } else {
                            req.setFeedback("Weaknesses:\n" + weaknesses);
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse AI response as JSON, storing as plain text: {}", e.getMessage());
                    req.setReview(aiResponse);
                }
                
                req.setStatus("COMPLETED");
                req.setReviewedAt(Instant.now());
                
                ReviewRequest saved = reviewRepository.save(req);
                return ResponseEntity.ok(saved);
            } catch (Exception e) {
                log.error("Error processing AI review: {}", e.getMessage(), e);
                Map<String, String> error = new HashMap<>();
                error.put("message", "Failed to generate AI review: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }
        }
        
        // Handle HUMAN (mentor) review
        if ("HUMAN".equals(req.getType())) {
            req.setStatus("PENDING");
            Resume resume = resumeRepository.findById(req.getResumeId())
                    .orElse(null);
            if (resume != null) {
                resume.setMentorReviewRequested(true);
                // Also ensure studentId is set if not already set
                if (req.getStudentId() == null || req.getStudentId().isEmpty()) {
                    req.setStudentId(resume.getStudentId());
                }
                resumeRepository.save(resume);
            }
        } else {
            req.setStatus("PENDING");
        }
        
        return ResponseEntity.ok(reviewRepository.save(req));
    }

    @GetMapping("/resume/{resumeId}")
    public List<ReviewRequest> byResume(@PathVariable String resumeId) {
        return reviewRepository.findByResumeId(resumeId);
    }

    @GetMapping("/student/{studentId}")
    public List<ReviewRequest> byStudent(@PathVariable String studentId) {
        List<ReviewRequest> reviews = reviewRepository.findByStudentId(studentId);
        // If no reviews found by studentId, try to find by resume's studentId
        if (reviews.isEmpty()) {
            // Find all resumes for this student
            List<Resume> studentResumes = resumeRepository.findByStudentId(studentId);
            // Find reviews for those resumes
            for (Resume resume : studentResumes) {
                List<ReviewRequest> resumeReviews = reviewRepository.findByResumeId(resume.getId());
                for (ReviewRequest review : resumeReviews) {
                    // Ensure studentId is set on the review
                    if (review.getStudentId() == null || review.getStudentId().isEmpty()) {
                        review.setStudentId(studentId);
                        reviewRepository.save(review);
                    }
                    if (!reviews.contains(review)) {
                        reviews.add(review);
                    }
                }
            }
        }
        return reviews;
    }

    // Mentor review endpoints
    @GetMapping("/mentor/pending")
    public List<ReviewRequest> getPendingMentorReviews() {
        return reviewRepository.findByTypeAndStatus("HUMAN", "PENDING");
    }

    @PostMapping("/mentor/{reviewId}/accept")
    public ResponseEntity<?> acceptReview(@PathVariable String reviewId, @RequestBody(required = false) AcceptRequest request) {
        try {
            ReviewRequest reviewRequest = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new RuntimeException("Review request not found with id: " + reviewId));
            
            if (!"PENDING".equals(reviewRequest.getStatus())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Review request is not in PENDING status. Current status: " + reviewRequest.getStatus());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            reviewRequest.setStatus("ACCEPTED");
            if (request != null && request.getMentorId() != null) {
                reviewRequest.setMentorId(request.getMentorId());
            } else {
                // Set a default mentor ID if not provided
                reviewRequest.setMentorId("admin");
            }
            ReviewRequest saved = reviewRepository.save(reviewRequest);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error accepting review request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/mentor/{reviewId}/reject")
    public ResponseEntity<?> rejectReview(@PathVariable String reviewId) {
        try {
            ReviewRequest reviewRequest = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new RuntimeException("Review request not found with id: " + reviewId));
            reviewRequest.setStatus("REJECTED");
            ReviewRequest saved = reviewRepository.save(reviewRequest);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error rejecting review request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/mentor/{reviewId}/submit")
    public ReviewRequest submitReview(@PathVariable String reviewId, @RequestBody MentorReviewSubmission submission) {
        ReviewRequest reviewRequest = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review request not found"));
        
        reviewRequest.setStatus("COMPLETED");
        reviewRequest.setRating(submission.getRating());
        reviewRequest.setReview(submission.getReview());
        reviewRequest.setSuggestions(submission.getSuggestions());
        reviewRequest.setOthers(submission.getOthers());
        reviewRequest.setReviewedAt(Instant.now());
        
        // Update resume to mark review as completed
        Resume resume = resumeRepository.findById(reviewRequest.getResumeId())
                .orElse(null);
        if (resume != null) {
            resume.setMentorReviewRequested(false);
            resumeRepository.save(resume);
        }
        
        return reviewRepository.save(reviewRequest);
    }

    @GetMapping("/mentor/{reviewId}")
    public ReviewRequest getReview(@PathVariable String reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review request not found"));
    }

    // DTOs for request bodies
    @lombok.Data
    public static class AcceptRequest {
        private String mentorId;
    }

    @lombok.Data
    public static class MentorReviewSubmission {
        private Integer rating;
        private String review;
        private String suggestions;
        private String others;
    }
}
