package com.example.lissomsoft.tms.dto;

public record ExamQuestionDTO(
        Integer questionNo,
        String topic,
        Integer level,
        String question,
        String optA,
        String optB,
        String optC,
        String optD,
        Integer timePerQuestionSeconds
) {}