package com.example.testing.repo;

import com.example.testing.model.TestPaper;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TestPaperRepository extends JpaRepository<TestPaper, Long> {
    @EntityGraph(attributePaths = {"questions"})
    List<TestPaper> findAllByOrderByUpdatedAtDesc();

    @Override
    @EntityGraph(attributePaths = {"questions", "questions.options"})
    Optional<TestPaper> findById(Long id);

    boolean existsByTitleIgnoreCase(String title);

    boolean existsByTitleIgnoreCaseAndIdNot(String title, Long id);
}
