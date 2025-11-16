package com.example.testing.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "test_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private TestPaper test;

    @Column(nullable = false)
    private String participantName;

    private Integer totalScore;

    private Integer maxScore;

    @Column(nullable = false)
    private Instant submittedAt;

    @ElementCollection
    @CollectionTable(name = "submission_answers", joinColumns = @JoinColumn(name = "submission_id"))
    @Builder.Default
    private List<SubmissionAnswer> answers = new ArrayList<>();

    @PrePersist
    public void onSubmit() {
        this.submittedAt = Instant.now();
    }
}
