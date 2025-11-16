package com.example.testing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record QuestionRequest(
        @NotBlank(message = "Enuntul este obligatoriu")
        String text,
        @Min(value = 1, message = "Intrebare trebuie sa valoreze cel putin 1 punct")
        Integer points,
        Integer orderIndex,
        @NotEmpty(message = "O intrebare are nevoie de minim 2 raspunsuri")
        List<@Valid OptionRequest> options
) {}
