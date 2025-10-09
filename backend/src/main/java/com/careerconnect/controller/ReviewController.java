package com.careerconnect.controller;

import com.careerconnect.model.ReviewRequest;
import com.careerconnect.repository.ReviewRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewRequestRepository reviewRepository;

    @PostMapping
    public ReviewRequest request(@RequestBody ReviewRequest req) {
        req.setStatus("PENDING");
        return reviewRepository.save(req);
    }

    @GetMapping("/resume/{resumeId}")
    public List<ReviewRequest> byResume(@PathVariable String resumeId) {
        return reviewRepository.findByResumeId(resumeId);
    }
}


