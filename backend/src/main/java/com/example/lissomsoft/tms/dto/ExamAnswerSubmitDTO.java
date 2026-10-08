package com.example.lissomsoft.tms.dto;

import java.time.LocalDate;

public record ExamAnswerSubmitDTO(
        Integer studentNo,
        String studentId,
        Integer testNo,
        LocalDate testDate,
        Integer questionNo,
        String courseId,
        Integer courseNo,
        String selectedAns,
        Integer timeTakenSeconds
) {}