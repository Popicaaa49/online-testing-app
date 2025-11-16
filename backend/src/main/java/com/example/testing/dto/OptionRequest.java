package com.example.testing.dto;

import jakarta.validation.constraints.NotBlank;

public record OptionRequest(
        @NotBlank(message = "Raspunsul nu poate fi gol")
        String text,
        boolean correct
) {}
