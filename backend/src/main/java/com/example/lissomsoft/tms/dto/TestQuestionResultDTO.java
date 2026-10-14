package com.example.lissomsoft.tms.dto;

/** One attended question of a completed test (used by "View More"). */
public record TestQuestionResultDTO(
        Integer questionNo,     // Q.No: original question number from the Question Bank
        String question,
        String optA,
        String optB,
        String optC,
        String optD,
        String studentAnswer,   // A / B / C / D, or null when not answered
        String correctAnswer,   // A / B / C / D
        int score               // 1 = correct, 0 = wrong / not answered
) {}
