package com.example.lissomsoft.tms.dto;

import java.util.List;

/**
 * Question-wise result of a completed test ("View More").
 * Only the questions the student actually answered are listed.
 */
public record TestResultDetailsDTO(
        int totalAssigned,      // questions assigned in the test setup
        int totalAttended,      // questions the student answered (= questions.size())
        int totalScore,         // sum of the per-question scores (1 correct, 0 wrong)
        List<TestQuestionResultDTO> questions
) {}
