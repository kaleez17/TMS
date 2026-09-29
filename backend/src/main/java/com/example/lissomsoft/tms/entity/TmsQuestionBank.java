package com.example.lissomsoft.tms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tms_question_bank")
@IdClass(TmsQuestionBankId.class)
public class TmsQuestionBank {

    @Id @Column(name = "Course_ID", length = 2)
    private String courseId;

    @Id @Column(name = "course_no")
    private Integer courseNo;

    @Id @Column(name = "Question_No")
    private Integer questionNo;

    @Column(name = "Topic", length = 25)
    private String topic;

    @Column(name = "Levels")
    private Integer levels;

    @Column(name = "Question", length = 150)
    private String question;

    @Column(name = "Opt_A", length = 100)
    private String optA;

    @Column(name = "Opt_B", length = 100)
    private String optB;

    @Column(name = "Opt_C", length = 100)
    private String optC;

    @Column(name = "Opt_D", length = 100)
    private String optD;

    @Column(name = "Ans", length = 1)
    private String ans;

    @Column(name = "scores")
    private Integer scores;

    @Column(name = "Entered_by", length = 25)
    private String enteredBy;

    @Column(name = "Entered_date")
    private LocalDate enteredDate;

    @Column(name = "del_flg", length = 1)
    private String delFlg;
}