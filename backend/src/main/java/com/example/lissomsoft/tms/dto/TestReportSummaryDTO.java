package com.example.lissomsoft.tms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Counts shown on the four cards of the Test Report Dashboard. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestReportSummaryDTO {
    private long allocated;   // every row in test_setup
    private long completed;   // stat = 1
    private long scheduled;   // stat = 0
    private long locked;      // stat = 2
}
