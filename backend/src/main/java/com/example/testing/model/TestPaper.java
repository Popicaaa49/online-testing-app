package com.example.testing.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestPaper {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String category;

    @Column(length = 2000)
    private String description;

    private Integer durationMinutes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<TestQuestion> questions = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void addQuestion(TestQuestion question) {
        question.setTest(this);
        this.questions.add(question);
    }

    public void setQuestions(List<TestQuestion> questions) {
        if (this.questions == null) {
            this.questions = new ArrayList<>();
        }
        this.questions.clear();
        if (questions != null) {
            questions.forEach(this::addQuestion);
        }
    }
}
