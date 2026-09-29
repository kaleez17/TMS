package com.example.lissomsoft.tms.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseDetId implements Serializable {
    private String courseId;
    private Integer courseDetId;

}