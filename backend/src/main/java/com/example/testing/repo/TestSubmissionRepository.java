package com.example.testing.repo;

import com.example.testing.model.TestSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TestSubmissionRepository extends JpaRepository<TestSubmission, Long> {
    List<TestSubmission> findTop10ByOrderBySubmittedAtDesc();
    boolean existsByTestIdAndParticipantName(Long testId, String participantName);

    @Query("select s from TestSubmission s join fetch s.test t where t.id = :testId order by s.submittedAt desc")
    List<TestSubmission> findByTestIdOrderBySubmittedAtDesc(@Param("testId") Long testId);
}
