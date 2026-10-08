package com.example.lissomsoft.tms.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestSetupId implements Serializable {
    private Integer studentNo;
    private String studentId;
    private Integer testNo;
    private LocalDate testDate;
}