package com.example.testing.service;

import com.example.testing.dto.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class TestNotificationService {
    private final SimpMessagingTemplate messagingTemplate;

    public TestNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishTestChange(TestEventType type, TestSummaryDto summary) {
        messagingTemplate.convertAndSend("/topic/tests", new TestEventDto(type, summary));
    }

    public void publishSubmission(SubmissionSummaryDto summary) {
        messagingTemplate.convertAndSend("/topic/submissions", summary);
    }
}
