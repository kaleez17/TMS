package com.example.lissomsoft.tms.controller;

import com.example.lissomsoft.tms.dto.ExamAnswerSubmitDTO;
import com.example.lissomsoft.tms.dto.ExamQuestionDTO;
import com.example.lissomsoft.tms.dto.TestResultDetailsDTO;
import com.example.lissomsoft.tms.dto.TestResultSummaryDTO;
import com.example.lissomsoft.tms.dto.TestSetupDTO;
import com.example.lissomsoft.tms.security.AuthenticatedPrincipal;
import com.example.lissomsoft.tms.service.ExamExecutionService;
import com.example.lissomsoft.tms.service.TestLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/exam-execution")
@RequiredArgsConstructor
public class ExamExecutionController {

    private final ExamExecutionService service;
    private final TestLockService lockService;

    @GetMapping("/my-tests")
    public List<TestSetupDTO> getMyTests(Authentication authentication) {
        String username = "admin";
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedPrincipal principal) {
            username = principal.userName();
        } else if (authentication != null) {
            username = authentication.getName();
        }
        lockService.releaseExpiredLocks();   // a lock older than 24h is already Scheduled
        return service.getTestsForStudent(username);
    }


    @GetMapping("/questions")
    public List<ExamQuestionDTO> getExamQuestions(
            @RequestParam(required = false, defaultValue = "") String courseId,
            @RequestParam(required = false, defaultValue = "0") Integer courseNo,
            @RequestParam(required = false, defaultValue = "1") Integer level,
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @RequestParam(required = false, defaultValue = "15") Integer timePerTestMinutes) {
        return service.getRandomizedQuestions(courseId, courseNo, level, limit, timePerTestMinutes);
    }

    @GetMapping("/test-summary")
    public TestResultSummaryDTO getTestSummary(
            @RequestParam Integer studentNo,
            @RequestParam String studentId,
            @RequestParam Integer testNo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate testDate) {
        return service.getTestResultSummary(studentNo, studentId, testNo, testDate);
    }

    // "View More" on a Completed test: every question, the answer given, the correct answer and the score
    @GetMapping("/test-details")
    public TestResultDetailsDTO getTestDetails(
            @RequestParam Integer studentNo,
            @RequestParam String studentId,
            @RequestParam Integer testNo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate testDate) {
        return service.getTestResultDetails(studentNo, studentId, testNo, testDate);
    }

    @PostMapping("/submit-answer")
    public void submitSingleAnswer(@RequestBody ExamAnswerSubmitDTO dto, Authentication authentication) {
        String username = "admin";
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedPrincipal principal) {
            username = principal.userName();
        } else if (authentication != null) {
            username = authentication.getName();
        }
        service.saveAnswer(dto, username);
    }

    @DeleteMapping("/reset-attempt")
    public void resetAttempt(
            @RequestParam Integer studentNo,
            @RequestParam String studentId,
            @RequestParam Integer testNo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate testDate) {
        service.clearPartialAttempt(studentNo, studentId, testNo, testDate);
    }

    // Called when the student reaches the tab-switch limit: stat -> 2 (Locked) for 24 hours
    @PostMapping("/lock-test")
    public void lockTest(
            @RequestParam Integer studentNo,
            @RequestParam String studentId,
            @RequestParam Integer testNo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate testDate) {
        lockService.lock(studentNo, studentId, testNo, testDate);
    }

    @PostMapping("/complete-test")
    public void completeTest(
            @RequestParam Integer studentNo,
            @RequestParam String studentId,
            @RequestParam Integer testNo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate testDate) {
        service.finalizeExam(studentNo, studentId, testNo, testDate);
    }
}