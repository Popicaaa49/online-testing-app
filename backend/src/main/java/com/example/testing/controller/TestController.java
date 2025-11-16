package com.example.testing.controller;

import com.example.testing.dto.*;
import com.example.testing.service.SubmissionService;
import com.example.testing.service.TestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
public class TestController {
    private final TestService testService;
    private final SubmissionService submissionService;

    public TestController(TestService testService, SubmissionService submissionService) {
        this.testService = testService;
        this.submissionService = submissionService;
    }

    @GetMapping
    public List<TestSummaryDto> list() {
        return testService.list();
    }

    @GetMapping("/{id}")
    public TestDetailDto byId(@PathVariable Long id, Authentication authentication) {
        boolean includeSolutions = isAdmin(authentication);
        return testService.findById(id, includeSolutions);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TestDetailDto> create(@Valid @RequestBody TestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(testService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TestDetailDto update(@PathVariable Long id, @Valid @RequestBody TestRequest request) {
        return testService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        testService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("isAuthenticated()")
    public SubmissionResponse submit(@PathVariable Long id, @Valid @RequestBody SubmissionRequest request) {
        return submissionService.submit(id, request);
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
                && !(authentication instanceof AnonymousAuthenticationToken)
                && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }
}
