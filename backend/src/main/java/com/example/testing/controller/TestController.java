package com.example.testing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/tests")
public class TestController {
    @GetMapping
    public List<Map<String, Object>> list() {
        return List.of(Map.of("id", 1, "title", "Demo test"));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(Map.of("status", "created", "data", payload));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(Map.of("status", "updated", "id", id, "data", payload));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("status", "deleted", "id", id));
    }
}
