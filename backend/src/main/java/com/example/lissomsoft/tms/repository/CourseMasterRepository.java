package com.example.lissomsoft.tms.repository;

import com.example.lissomsoft.tms.entity.CourseMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseMasterRepository extends JpaRepository<CourseMaster, String> {
    List<CourseMaster> findByDelFlag(String delFlag);}