package com.example.testing.repo;

import com.example.testing.model.TestSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestSubmissionRepository extends JpaRepository<TestSubmission, Long> {
    List<TestSubmission> findTop10ByOrderBySubmittedAtDesc();
}
