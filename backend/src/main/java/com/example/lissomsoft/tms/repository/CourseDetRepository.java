package com.example.lissomsoft.tms.repository;

import com.example.lissomsoft.tms.entity.CourseDet;
import com.example.lissomsoft.tms.entity.CourseDetId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseDetRepository extends JpaRepository<CourseDet, CourseDetId> {
  List<CourseDet> findByCourseId(String courseId);
}