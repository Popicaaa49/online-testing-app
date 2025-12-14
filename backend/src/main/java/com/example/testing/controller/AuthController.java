package com.example.testing.controller;

import com.example.testing.dto.RegisterRequest;
import com.example.testing.model.User;
import com.example.testing.repo.RoleRepository;
import com.example.testing.repo.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

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

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        String username = request.username().trim();
        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username deja folosit"));
        }

        var userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Rolul implicit lipseste"));

        User toSave = User.builder()
                .username(username)
                .password(passwordEncoder.encode(request.password()))
                .roles(Set.of(userRole))
                .enabled(true)
                .build();

        userRepository.save(toSave);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("username", toSave.getUsername()));
    }
}
