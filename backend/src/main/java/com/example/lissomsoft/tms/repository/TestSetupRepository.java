package com.example.lissomsoft.tms.repository;

import com.example.lissomsoft.tms.entity.TestSetup;
import com.example.lissomsoft.tms.entity.TestSetupId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TestSetupRepository extends JpaRepository<TestSetup, TestSetupId> {

    @Query("SELECT COALESCE(MAX(ts.testNo), 0) + 1 FROM TestSetup ts " +
            "WHERE ts.studentNo = :studentNo AND ts.testDate = :testDate")
    Integer getNextTestNoForStudentAndDate(@Param("studentNo") Integer studentNo,
                                           @Param("testDate") LocalDate testDate);

    List<TestSetup> findByStudentNoAndStudentId(Integer studentNo, String studentId);

    // ---- Test Report Dashboard counts (stat: 0 = Scheduled, 1 = Completed, 2 = Locked) ----
    @Query("SELECT COUNT(ts) FROM TestSetup ts WHERE ts.stat IS NULL OR ts.stat = '0'")
    long countScheduled();

    @Query("SELECT COUNT(ts) FROM TestSetup ts WHERE ts.stat = '1'")
    long countCompleted();

    @Query("SELECT COUNT(ts) FROM TestSetup ts WHERE ts.stat = '2'")
    long countLocked();

    // Locked for 24 hours or more -> back to Scheduled
    @Modifying
    @Query("UPDATE TestSetup ts SET ts.stat = '0', ts.lockedAt = NULL " +
            "WHERE ts.stat = '2' AND (ts.lockedAt IS NULL OR ts.lockedAt <= :cutoff)")
    int releaseExpiredLocks(@Param("cutoff") LocalDateTime cutoff);
}
