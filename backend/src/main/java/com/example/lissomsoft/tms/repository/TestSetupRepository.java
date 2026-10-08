package com.example.lissomsoft.tms.repository;

import com.example.lissomsoft.tms.entity.TestSetup;
import com.example.lissomsoft.tms.entity.TestSetupId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TestSetupRepository extends JpaRepository<TestSetup, TestSetupId> {

    @Query("SELECT COALESCE(MAX(ts.testNo), 0) + 1 FROM TestSetup ts " +
            "WHERE ts.studentNo = :studentNo AND ts.testDate = :testDate")
    Integer getNextTestNoForStudentAndDate(@Param("studentNo") Integer studentNo,
                                           @Param("testDate") LocalDate testDate);

    List<TestSetup> findByStudentNoAndStudentId(Integer studentNo, String studentId);
}