package com.example.testing.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal UserDetails user) {
        boolean authenticated = user != null;
        Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("authenticated", authenticated);
        payload.put("username", authenticated ? user.getUsername() : null);
        payload.put("roles", authenticated
                ? user.getAuthorities().stream().map(Object::toString).toList()
                : List.of());
        return payload;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(HttpServletRequest request) {
        CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        return Map.of("headerName", token.getHeaderName(), "token", token.getToken());
    }
}
