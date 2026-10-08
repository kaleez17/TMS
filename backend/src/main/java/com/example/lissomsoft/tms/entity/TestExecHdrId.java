package com.example.lissomsoft.tms.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class
TestExecHdrId implements Serializable {
    private Integer studentNo;
    private String studentId;
    private Integer testNo;
    private LocalDate testDate;
    private Integer questionNo;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TestExecHdrId that)) return false;
        return Objects.equals(studentNo, that.studentNo) &&
                Objects.equals(studentId, that.studentId) &&
                Objects.equals(testNo, that.testNo) &&
                Objects.equals(testDate, that.testDate) &&
                Objects.equals(questionNo, that.questionNo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(studentNo, studentId, testNo, testDate, questionNo);
    }
}