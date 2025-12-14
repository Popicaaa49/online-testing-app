package com.example.testing.service;

import com.example.testing.dto.SubmissionRequest;
import com.example.testing.dto.SubmissionResponse;
import com.example.testing.dto.SubmissionSummaryDto;
import com.example.testing.model.SubmissionAnswer;
import com.example.testing.model.TestPaper;
import com.example.testing.model.TestQuestion;
import com.example.testing.model.TestSubmission;
import com.example.testing.repo.TestPaperRepository;
import com.example.testing.repo.TestSubmissionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SubmissionService {
    private final TestPaperRepository testPaperRepository;
    private final TestSubmissionRepository submissionRepository;
    private final TestNotificationService notificationService;

    public SubmissionService(TestPaperRepository testPaperRepository,
                             TestSubmissionRepository submissionRepository,
                             TestNotificationService notificationService) {
        this.testPaperRepository = testPaperRepository;
        this.submissionRepository = submissionRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public SubmissionResponse submit(Long testId, SubmissionRequest request) {
        TestPaper test = testPaperRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Testul nu exista"));

        String participantName = request.participantName() != null ? request.participantName().trim() : "";
        if (participantName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Introdu numele participantului");
        }

        if (submissionRepository.existsByTestIdAndParticipantName(testId, participantName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Rezultatele au fost deja trimise.");
        }

        Map<Long, Long> answers = request.answers();
        if (answers == null || answers.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trimite raspunsurile selectate");
        }

        var validQuestionIds = test.getQuestions().stream()
                .map(TestQuestion::getId)
                .collect(Collectors.toSet());

        answers.keySet().stream()
                .filter(id -> !validQuestionIds.contains(id))
                .findFirst()
                .ifPresent(id -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intrebare invalida in payload");
                });

        int maxScore = test.getQuestions().stream()
                .mapToInt(q -> q.getPoints() != null ? q.getPoints() : 1)
                .sum();

        List<SubmissionAnswer> submissionAnswers = new ArrayList<>();
        int totalScore = 0;

        for (TestQuestion question : test.getQuestions()) {
            Long selectedOptionId = answers.get(question.getId());
            boolean correct = false;
            if (selectedOptionId != null) {
                var option = question.getOptions().stream()
                        .filter(opt -> opt.getId().equals(selectedOptionId))
                        .findFirst()
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Optiune invalida pentru intrebare"));
                correct = option.isCorrect();
                if (correct) {
                    totalScore += question.getPoints() != null ? question.getPoints() : 1;
                }
            }
            submissionAnswers.add(SubmissionAnswer.builder()
                    .questionId(question.getId())
                    .optionId(selectedOptionId)
                    .correct(correct)
                    .build());
        }

        TestSubmission submission = TestSubmission.builder()
                .test(test)
                .participantName(participantName)
                .totalScore(totalScore)
                .maxScore(maxScore)
                .answers(submissionAnswers)
                .build();

        TestSubmission saved = submissionRepository.save(submission);

        double pct = maxScore == 0 ? 0 : Math.round((totalScore * 10000.0 / maxScore)) / 100.0;
        SubmissionResponse response = new SubmissionResponse(
                saved.getId(),
                test.getId(),
                totalScore,
                maxScore,
                pct,
                saved.getSubmittedAt()
        );

        notificationService.publishSubmission(new SubmissionSummaryDto(
                saved.getId(),
                test.getId(),
                test.getTitle(),
                request.participantName(),
                totalScore,
                maxScore,
                saved.getSubmittedAt()
        ));
        return response;
    }
}
