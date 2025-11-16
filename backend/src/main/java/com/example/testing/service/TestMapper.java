package com.example.testing.service;

import com.example.testing.dto.*;
import com.example.testing.model.AnswerOption;
import com.example.testing.model.TestPaper;
import com.example.testing.model.TestQuestion;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class TestMapper {

    public TestPaper toEntity(TestRequest request) {
        TestPaper test = new TestPaper();
        apply(request, test);
        return test;
    }

    public void apply(TestRequest request, TestPaper test) {
        test.setTitle(request.title().trim());
        test.setCategory(request.category());
        test.setDescription(request.description());
        test.setDurationMinutes(request.durationMinutes() != null ? request.durationMinutes() : 30);

        AtomicInteger fallbackIndex = new AtomicInteger(1);
        List<TestQuestion> questions = request.questions().stream()
                .map(questionRequest -> {
                    TestQuestion question = TestQuestion.builder()
                            .text(questionRequest.text().trim())
                            .points(questionRequest.points() != null ? questionRequest.points() : 1)
                            .orderIndex(questionRequest.orderIndex() != null
                                    ? questionRequest.orderIndex()
                                    : fallbackIndex.getAndIncrement())
                            .build();

                    questionRequest.options().forEach(optionRequest -> {
                        AnswerOption option = AnswerOption.builder()
                                .text(optionRequest.text().trim())
                                .correct(optionRequest.correct())
                                .build();
                        question.addOption(option);
                    });
                    return question;
                })
                .toList();
        test.setQuestions(questions);
    }

    public TestDetailDto toDetail(TestPaper test, boolean includeSolutions) {
        List<TestQuestionDto> questionDtos = test.getQuestions().stream()
                .sorted(Comparator.comparing(
                        q -> q.getOrderIndex() == null ? Integer.MAX_VALUE : q.getOrderIndex()))
                .map(question -> new TestQuestionDto(
                        question.getId(),
                        question.getText(),
                        question.getPoints(),
                        question.getOrderIndex(),
                        question.getOptions().stream()
                                .map(option -> new AnswerOptionDto(
                                        option.getId(),
                                        option.getText(),
                                        includeSolutions && option.isCorrect()))
                                .toList()
                ))
                .toList();
        return new TestDetailDto(
                test.getId(),
                test.getTitle(),
                test.getDescription(),
                test.getCategory(),
                test.getDurationMinutes(),
                test.getCreatedAt(),
                test.getUpdatedAt(),
                questionDtos
        );
    }

    public TestSummaryDto toSummary(TestPaper test) {
        return new TestSummaryDto(
                test.getId(),
                test.getTitle(),
                test.getCategory(),
                test.getDurationMinutes(),
                test.getQuestions() != null ? test.getQuestions().size() : 0,
                test.getUpdatedAt()
        );
    }
}
