package com.example.lissomsoft.tms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "test_exec_hdr")
@IdClass(TestExecHdrId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestExecHdr {

    @Id
    @Column(name = "Student_No", nullable = false)
    private Integer studentNo;

    @Id
    @Column(name = "student_id", length = 255, nullable = false)
    private String studentId;

    @Id
    @Column(name = "Test_no", nullable = false)
    private Integer testNo;

    @Id
    @Column(name = "Test_Date", nullable = false)
    private LocalDate testDate;

    @Id
    @Column(name = "Question_No", nullable = false)
    private Integer questionNo;

    @Column(name = "Course_ID", length = 2, nullable = false)
    private String courseId;

    @Column(name = "Course_No", nullable = false)
    private Integer courseNo;

    @Column(name = "stud_ans", length = 1)
    private String studAns;

    @Column(name = "correct_ans", length = 1, nullable = false)
    private String correctAns;

    @Column(name = "score", nullable = false)
    private Integer score = 0;

    @Column(name = "entry_by", length = 25)
    private String entryBy;

    @Column(name = "entry_date")
    private LocalDate entryDate;
}