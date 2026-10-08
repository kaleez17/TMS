package com.example.lissomsoft.tms.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TestSetupDTO {
    private Integer studentNo;
    private String studentId;
    private String studentName;
    private String mobileNo;
    private Integer testNo;
    private LocalDate testDate;
    private Integer noOfQuestions;
    private Integer timePerTest;
    private String courseId;
    private Integer courseNo;
    private String topicName;
    private Integer lvl;
    private String testConductedBy;
    private String evaluatorName;
    private LocalDate executedDate;
    private String stat;
    private String entryBy;
    private LocalDate entryDate;
    private String delFlag;

    private String studyMode;       // Offline / Online
    private String assignedStaff;   // Trainer name
    private LocalDate joiningDate;  // Joining Date
}