package com.example.testing.controller;

import com.example.testing.dto.SubmissionSummaryDto;
import com.example.testing.model.TestSubmission;
import com.example.testing.repo.TestSubmissionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@PreAuthorize("hasRole('ADMIN')")
public class SubmissionController {

    private final TestSubmissionRepository submissionRepository;

    public SubmissionController(TestSubmissionRepository submissionRepository) {
        this.submissionRepository = submissionRepository;
    }

    @GetMapping
    public List<SubmissionSummaryDto> byTest(@RequestParam("testId") Long testId) {
        return submissionRepository.findByTestIdOrderBySubmittedAtDesc(testId).stream()
                .map(this::toDto)
                .toList();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!submissionRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Submisia nu exista");
        }
        submissionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private SubmissionSummaryDto toDto(TestSubmission submission) {
        return new SubmissionSummaryDto(
                submission.getId(),
                submission.getTest().getId(),
                submission.getTest().getTitle(),
                submission.getParticipantName(),
                submission.getTotalScore(),
                submission.getMaxScore(),
                submission.getSubmittedAt()
        );
    }
}
