package com.example.testing.dto;

import java.time.Instant;

public record SubmissionResponse(
        Long submissionId,
        Long testId,
        int totalScore,
        int maxScore,
        double percentage,
        Instant submittedAt
) {}
