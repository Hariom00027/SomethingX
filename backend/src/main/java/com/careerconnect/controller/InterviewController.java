package com.careerconnect.controller;

import com.careerconnect.model.Interview;
import com.careerconnect.repository.InterviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/interviews")
public class InterviewController {

    @Autowired
    private InterviewRepository interviewRepository;

    @PostMapping
    public Interview createInterview(@RequestBody Interview interview) {
        return interviewRepository.save(interview);
    }

    @GetMapping
    public List<Interview> getAllInterviews() {
        return interviewRepository.findAll();
    }
}
