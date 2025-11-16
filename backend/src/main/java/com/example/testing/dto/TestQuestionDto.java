package com.example.testing.dto;

import java.util.List;

public record TestQuestionDto(
        Long id,
        String text,
        Integer points,
        Integer orderIndex,
        List<AnswerOptionDto> options
) {}
