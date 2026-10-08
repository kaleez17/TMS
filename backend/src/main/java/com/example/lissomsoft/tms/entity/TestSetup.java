package com.example.lissomsoft.tms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "test_setup")
@IdClass(TestSetupId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestSetup {

    @Id
    @Column(name = "Student_No")
    private Integer studentNo;

    @Id
    @Column(name = "student_id")
    private String studentId;

    @Id
    @Column(name = "Test_no")
    private Integer testNo;

    @Id
    @Column(name = "Test_Date")
    private LocalDate testDate;

    @Column(name = "no_of_questions")
    private Integer noOfQuestions;

    @Column(name = "time_per_test")
    private Integer timePerTest;

    @Column(name = "student_name")
    private String StudentName;

    @Column(name = "mobile_no")
    private String mobileNo;

    @Column(name = "course_id")
    private String courseId;

    @Column(name = "Course_No")
    private Integer courseNo;

    @Column(name = "Lvl")
    private Integer lvl;

    @Column(name = "test_conducted_by")
    private String testConductedBy;

    @Column(name = "Executed_date")
    private LocalDate executedDate;

    @Column(name = "stat")
    private String stat;

    @Column(name = "entry_by")
    private String entryBy;

    @Column(name = "Entry_date")
    private LocalDate entryDate;

    @Column(name = "del_flag")
    private String delFlag;
}