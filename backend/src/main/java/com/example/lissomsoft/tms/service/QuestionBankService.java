package com.example.lissomsoft.tms.service;

import com.example.lissomsoft.tms.entity.*;
import com.example.lissomsoft.tms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
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

    public List<TmsQuestionBank> getAll(String cId, Integer cNo, Integer qNo) {
        if (cId != null && !cId.isEmpty() && cNo != null && qNo != null) {
            return qbRepo.findByCourseIdAndCourseNoAndQuestionNo(cId, cNo, qNo);
        } else if (cId != null && !cId.isEmpty() && cNo != null) {
            return qbRepo.findByCourseIdAndCourseNo(cId, cNo);
        } else if (cId != null && !cId.isEmpty()) {
            return qbRepo.findByCourseId(cId);
        }
        return qbRepo.findAll();  }

    public TmsQuestionBank save(TmsQuestionBank q) {
        if (q.getDelFlg() == null) q.setDelFlg("A");
        if (q.getEnteredDate() == null) q.setEnteredDate(LocalDate.now());
        return qbRepo.save(q);
    }

  
}