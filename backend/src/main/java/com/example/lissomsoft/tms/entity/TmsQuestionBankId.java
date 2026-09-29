package com.example.lissomsoft.tms.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TmsQuestionBankId implements Serializable {
    private String courseId;
    private Integer courseNo;
    private Integer questionNo;
}