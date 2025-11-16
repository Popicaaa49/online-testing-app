package com.example.testing.dto;

import java.time.Instant;

public record SubmissionSummaryDto(
        Long submissionId,
        Long testId,
        String testTitle,
        String participantName,
        int totalScore,
        int maxScore,
        Instant submittedAt
) {}
