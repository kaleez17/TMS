package com.example.lissomsoft.tms.repository;

import com.example.lissomsoft.tms.entity.TestExecHdr;
import com.example.lissomsoft.tms.entity.TestExecHdrId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TestExecHdrRepository extends JpaRepository<TestExecHdr, TestExecHdrId> {

    @Modifying
    @Query("""
        DELETE FROM TestExecHdr t 
        WHERE t.studentNo = :studentNo 
          AND t.studentId = :studentId 
          AND t.testNo = :testNo 
          AND t.testDate = :testDate
    """)
    void deleteAttemptRecords(
            @Param("studentNo") Integer studentNo,
            @Param("studentId") String studentId,
            @Param("testNo") Integer testNo,
            @Param("testDate") LocalDate testDate
    );

    List<TestExecHdr> findByStudentNoAndStudentIdAndTestNoAndTestDate(
            Integer studentNo, String studentId, Integer testNo, LocalDate testDate
    );
    Optional<TestExecHdr> findByStudentNoAndStudentIdAndTestNoAndTestDateAndQuestionNo(
            Integer studentNo,
            String studentId,
            Integer testNo,
            LocalDate testDate,
            Integer questionNo
    );
}