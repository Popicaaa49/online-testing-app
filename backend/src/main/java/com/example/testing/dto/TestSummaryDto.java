package com.example.testing.dto;

import java.time.Instant;

public record TestSummaryDto(
        Long id,
        String title,
        String category,
        Integer durationMinutes,
        int questionCount,
        Instant updatedAt
) {}
