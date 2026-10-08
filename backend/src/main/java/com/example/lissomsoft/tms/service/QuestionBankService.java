package com.example.lissomsoft.tms.service;

import com.example.lissomsoft.tms.entity.*;
import com.example.lissomsoft.tms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class QuestionBankService {
    @Autowired private CourseMasterRepository masterRepo;
    @Autowired private CourseDetRepository detRepo;
    @Autowired private TmsQuestionBankRepository qbRepo;

    public List<CourseMaster> getCourses() {
        return masterRepo.findAll();
    }

    public List<CourseDet> getDetails(String cId) {
        return detRepo.findByCourseId(cId);
    }

    public List<Integer> getQNos(String cId, Integer cNo) {
        return qbRepo.findQNos(cId, cNo);
    }


    public Page<TmsQuestionBank> getQuestions(String courseId, Integer courseNo, Integer questionNo, String status, Pageable pageable) {
        String cleanCourseId = (courseId != null && !courseId.trim().isEmpty() && !"null".equalsIgnoreCase(courseId)) ? courseId.trim() : null;

        String delFlg = null;
        if ("ACTIVE".equalsIgnoreCase(status)) {
            delFlg = "A";
        } else if ("DEACTIVE".equalsIgnoreCase(status)) {
            delFlg = "D";
        }

        return qbRepo.findQuestionsWithFilter(cleanCourseId, courseNo, questionNo, delFlg, pageable);
    }

    public TmsQuestionBank save(TmsQuestionBank q) {
        if (q.getDelFlg() == null) q.setDelFlg("A");
        if (q.getEnteredDate() == null) q.setEnteredDate(LocalDate.now());
        return qbRepo.save(q);
    }
}