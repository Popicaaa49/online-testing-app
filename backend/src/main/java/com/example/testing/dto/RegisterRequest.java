package com.example.testing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Introdu un username")
        @Size(min = 3, max = 32, message = "Username-ul trebuie sa aiba intre 3 si 32 de caractere")
        String username,

        @NotBlank(message = "Introdu o parola")
        @Size(min = 6, max = 64, message = "Parola trebuie sa aiba intre 6 si 64 de caractere")
        String password
) {
}
