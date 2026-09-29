package com.example.lissomsoft.tms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@Entity
@Table(name = "course_det")
@IdClass(CourseDetId.class)
public class CourseDet {
    @Id @Column(name = "Course_ID", length = 2)
    private String courseId;

    @Id @Column(name = "Course_DET_ID")
    private Integer courseDetId;

    @Column(name = "Tech", length = 25)
    private String tech;

    @Column(name = "topic", length = 100)
    private String topic;

    @Column(name = "duration_week")
    private BigDecimal durationWeek;

    @Column(name = "hours")
    private Integer hours;

    @Column(name = "entry_by")
    private String entryBy;

    @Column(name = "entry_date")
    private LocalDate entryDate;

    @Column(name = "Del_flg")
    private String delFlg;
}