package com.example.testing.service;

import com.example.testing.dto.*;
import com.example.testing.model.TestPaper;
import com.example.testing.repo.TestPaperRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TestService {
    private final TestPaperRepository testPaperRepository;
    private final TestMapper mapper;
    private final TestNotificationService notificationService;

    public TestService(TestPaperRepository testPaperRepository,
                       TestMapper mapper,
                       TestNotificationService notificationService) {
        this.testPaperRepository = testPaperRepository;
        this.mapper = mapper;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<TestSummaryDto> list() {
        return testPaperRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(mapper::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public TestDetailDto findById(Long id, boolean includeSolutions) {
        TestPaper test = testPaperRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Testul nu exista"));
        return mapper.toDetail(test, includeSolutions);
    }

    @Transactional
    public TestDetailDto create(TestRequest request) {
        validate(request, null);
        TestPaper saved = testPaperRepository.saveAndFlush(mapper.toEntity(request));
        notificationService.publishTestChange(TestEventType.CREATED, mapper.toSummary(saved));
        return mapper.toDetail(saved, true);
    }

    @Transactional
    public TestDetailDto update(Long id, TestRequest request) {
        TestPaper existing = testPaperRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Testul nu exista"));
        validate(request, id);
        mapper.apply(request, existing);
        TestPaper saved = testPaperRepository.saveAndFlush(existing);
        notificationService.publishTestChange(TestEventType.UPDATED, mapper.toSummary(saved));
        return mapper.toDetail(saved, true);
    }

    @Transactional
    public void delete(Long id) {
        TestPaper existing = testPaperRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Testul nu exista"));
        TestSummaryDto summary = mapper.toSummary(existing);
        testPaperRepository.delete(existing);
        notificationService.publishTestChange(TestEventType.DELETED, summary);
    }

    private void validate(TestRequest request, Long currentId) {
        if (request.questions() == null || request.questions().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Testul are nevoie de minim o intrebare");
        }

        request.questions().forEach(question -> {
            if (question.options() == null || question.options().size() < 2) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fiecare intrebare trebuie sa contina cel putin doua optiuni");
            }
            long correctCount = question.options().stream().filter(OptionRequest::correct).count();
            if (correctCount != 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seteaza exact un raspuns corect per intrebare");
            }
        });

        String normalizedTitle = request.title().trim();

        if (currentId == null && testPaperRepository.existsByTitleIgnoreCase(normalizedTitle)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Exista deja un test cu acest titlu");
        }
        if (currentId != null && testPaperRepository.existsByTitleIgnoreCaseAndIdNot(normalizedTitle, currentId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Titlul apartine deja altui test");
        }
    }
}
