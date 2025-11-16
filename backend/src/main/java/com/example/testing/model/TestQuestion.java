package com.example.testing.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id")
    private TestPaper test;

    @Column(nullable = false, length = 1000)
    private String text;

    private Integer points;

    private Integer orderIndex;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    @Builder.Default
    private List<AnswerOption> options = new ArrayList<>();

    public void addOption(AnswerOption option) {
        option.setQuestion(this);
        this.options.add(option);
    }

    public void setOptions(List<AnswerOption> options) {
        if (this.options == null) {
            this.options = new ArrayList<>();
        }
        this.options.clear();
        if (options != null) {
            options.forEach(this::addOption);
        }
    }
}
