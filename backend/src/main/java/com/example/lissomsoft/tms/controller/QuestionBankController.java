package com.example.lissomsoft.tms.controller;

import com.example.lissomsoft.tms.entity.*;
import com.example.lissomsoft.tms.service.QuestionBankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"},
        allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/api")
public class QuestionBankController {
    @Autowired private QuestionBankService s;

    @GetMapping("/courses")
    public List<CourseMaster> courses() {
        return s.getCourses();
    }

    @GetMapping("/courses/{id}/details")
    public List<CourseDet> details(@PathVariable String id) {
        return s.getDetails(id);
    }

    @GetMapping("/questions/numbers")
    public List<Integer> numbers(@RequestParam String courseId, @RequestParam Integer courseNo) {
        return s.getQNos(courseId, courseNo);
    }


    @GetMapping("/questions")
    public ResponseEntity<Page<TmsQuestionBank>> list(
            @RequestParam(required = false) String courseId,
            @RequestParam(required = false) Integer courseNo,
            @RequestParam(required = false) Integer questionNo,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<TmsQuestionBank> result = s.getQuestions(courseId, courseNo, questionNo, status, pageable);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/questions")
    public TmsQuestionBank create(@RequestBody TmsQuestionBank q) {
        return s.save(q);
    }

    @PutMapping("/questions/{cid}/{cno}/{qno}")
    public TmsQuestionBank update(@RequestBody TmsQuestionBank q) {
        return s.save(q);
    }
}