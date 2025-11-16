package com.example.testing.dto;

public record TestEventDto(
        TestEventType type,
        TestSummaryDto payload
) {}
