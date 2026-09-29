package com.example.lissomsoft.tms.repository;

import com.example.lissomsoft.tms.entity.TmsQuestionBank;
import com.example.lissomsoft.tms.entity.TmsQuestionBankId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TmsQuestionBankRepository extends JpaRepository<TmsQuestionBank, TmsQuestionBankId> {

    @Query("SELECT q.questionNo FROM TmsQuestionBank q WHERE q.courseId = :cId AND q.courseNo = :cNo")
    List<Integer> findQNos(@Param("cId") String cId, @Param("cNo") Integer cNo);

    List<TmsQuestionBank> findByCourseId(String courseId);

    List<TmsQuestionBank> findByCourseIdAndCourseNo(String courseId, Integer courseNo);

    List<TmsQuestionBank> findByCourseIdAndCourseNoAndQuestionNo(String courseId, Integer courseNo, Integer questionNo);
}