package com.careerconnect.controller;

import com.careerconnect.model.ReviewRequest;
import com.careerconnect.model.Resume;
import com.careerconnect.repository.ReviewRequestRepository;
import com.careerconnect.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewRequestRepository reviewRepository;
    private final ResumeRepository resumeRepository;

    @PostMapping
    public ReviewRequest request(@RequestBody ReviewRequest req) {
        req.setStatus("PENDING");
        req.setRequestedAt(Instant.now());
        
        // If it's a mentor review, mark the resume accordingly
        if ("HUMAN".equals(req.getType())) {
            Resume resume = resumeRepository.findById(req.getResumeId())
                    .orElse(null);
            if (resume != null) {
                resume.setMentorReviewRequested(true);
                resumeRepository.save(resume);
            }
        }
        
        return reviewRepository.save(req);
    }

    @GetMapping("/resume/{resumeId}")
    public List<ReviewRequest> byResume(@PathVariable String resumeId) {
        return reviewRepository.findByResumeId(resumeId);
    }

    @GetMapping("/student/{studentId}")
    public List<ReviewRequest> byStudent(@PathVariable String studentId) {
        return reviewRepository.findByStudentId(studentId);
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
