package com.example.lissomsoft.tms.controller;

import com.example.lissomsoft.tms.dto.TestReportSummaryDTO;
import com.example.lissomsoft.tms.dto.TestSetupDTO;
import com.example.lissomsoft.tms.security.RequiresScreen;
import com.example.lissomsoft.tms.service.TestLockService;
import com.example.lissomsoft.tms.service.TestReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

import java.util.List;

/** Endpoints for the Test Report Dashboard (screen code TRPT). */
@RestController
@RequestMapping("/api/test-report")
@RequiredArgsConstructor
@RequiresScreen("TRPT")
public class TestReportController {

    private final TestReportService service;
    private final TestLockService lockService;

    @GetMapping("/summary")
    public TestReportSummaryDTO summary() {
        return service.summary();
    }

    // category = ALLOCATED | COMPLETED | SCHEDULED | LOCKED
    @GetMapping("/details")
    public List<TestSetupDTO> details(
            @RequestParam(defaultValue = "ALLOCATED") String category,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer studentNo) {
        return service.details(category, name, studentNo);
    }

    // Unlock button on the View popup: stat 2 (Locked) -> 0 (Scheduled)
    @PostMapping("/unlock")
    public void unlock(
            @RequestParam Integer studentNo,
            @RequestParam String studentId,
            @RequestParam Integer testNo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate testDate) {
        lockService.unlock(studentNo, studentId, testNo, testDate);
    }
}
