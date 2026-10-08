package com.example.lissomsoft.tms.repository;

import com.example.lissomsoft.tms.entity.TmsQuestionBank;
import com.example.lissomsoft.tms.entity.TmsQuestionBankId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TmsQuestionBankRepository extends JpaRepository<TmsQuestionBank, TmsQuestionBankId> {

    @Query("SELECT q.questionNo FROM TmsQuestionBank q WHERE q.courseId = :cId AND q.courseNo = :cNo")
    List<Integer> findQNos(@Param("cId") String cId, @Param("cNo") Integer cNo);

    @Query(value = "SELECT q FROM TmsQuestionBank q WHERE " +
            "(:cId IS NULL OR q.courseId = :cId) AND " +
            "(:cNo IS NULL OR q.courseNo = :cNo) AND " +
            "(:qNo IS NULL OR q.questionNo = :qNo) AND " +
            "(:delFlg IS NULL OR q.delFlg = :delFlg)",
            countQuery = "SELECT count(1) FROM TmsQuestionBank q WHERE " +
                    "(:cId IS NULL OR q.courseId = :cId) AND " +
                    "(:cNo IS NULL OR q.courseNo = :cNo) AND " +
                    "(:qNo IS NULL OR q.questionNo = :qNo) AND " +
                    "(:delFlg IS NULL OR q.delFlg = :delFlg)")
    Page<TmsQuestionBank> findQuestionsWithFilter(
            @Param("cId") String cId,
            @Param("cNo") Integer cNo,
            @Param("qNo") Integer qNo,
            @Param("delFlg") String delFlg,
            Pageable pageable);

    // --- Added for Exam Execution ---

    @Query(value = "SELECT * FROM tms_question_bank WHERE course_id = :courseId AND course_no = :courseNo AND levels = :level ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<TmsQuestionBank> findRandomizedExamQuestions(@Param("courseId") String courseId,
                                                      @Param("courseNo") Integer courseNo,
                                                      @Param("level") Integer level,
                                                      @Param("limit") Integer limit);

    @Query("SELECT q.ans FROM TmsQuestionBank q WHERE q.courseId = :courseId AND q.courseNo = :courseNo AND q.questionNo = :questionNo")
    String findCorrectAnswer(
            @Param("courseId") String courseId,
            @Param("courseNo") Integer courseNo,
            @Param("questionNo") Integer questionNo
    );
}