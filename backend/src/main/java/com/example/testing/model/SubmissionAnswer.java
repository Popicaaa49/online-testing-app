package com.example.testing.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionAnswer {
    @Column(name = "question_id")
    private Long questionId;

    @Column(name = "option_id")
    private Long optionId;

    private boolean correct;
}
