package com.example.testing.dto;

import java.time.Instant;
import java.util.List;

public record TestDetailDto(
        Long id,
        String title,
        String description,
        String category,
        Integer durationMinutes,
        Instant createdAt,
        Instant updatedAt,
        List<TestQuestionDto> questions
) {}
