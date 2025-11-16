package com.example.testing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.Map;

public record SubmissionRequest(
        @NotBlank(message = "Introdu numele participantului")
        String participantName,
        @NotEmpty(message = "Trimite raspunsurile pentru test")
        Map<Long, Long> answers
) {}
