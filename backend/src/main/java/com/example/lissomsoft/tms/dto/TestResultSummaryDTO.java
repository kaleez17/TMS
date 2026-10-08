package com.example.lissomsoft.tms.dto;

import java.time.LocalDate;

public record TestResultSummaryDTO(
        Integer studentNo,
        String studentId,
        Integer testNo,
        LocalDate testDate,
        String courseId,
        Integer courseNo,
        int totalAssignedQuestions,
        int totalAttendedQuestions,
        int totalScore,
        double percentage,
        String resultStatus // "PASSED" or "NEEDS IMPROVEMENT"
) {}