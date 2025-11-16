package com.example.testing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record TestRequest(
        @NotBlank(message = "Titlul testului este obligatoriu")
        String title,
        String category,
        String description,
        @Min(value = 5, message = "Durata minima este 5 minute")
        @Max(value = 180, message = "Durata maxima este 180 minute")
        Integer durationMinutes,
        @NotEmpty(message = "Adauga cel putin o intrebare")
        List<@Valid QuestionRequest> questions
) {}
