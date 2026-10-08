package com.example.lissomsoft.tms.controller;

import com.example.lissomsoft.tms.dto.*;
import com.example.lissomsoft.tms.service.TestSetupService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.*;

@RestController
@RequestMapping("/api/test-setup")
@RequiredArgsConstructor
public class TestSetupController {

    private final TestSetupService service;

    @GetMapping
    public ResponseEntity<Page<TestSetupDTO>> getGridData(
            @RequestParam(required = false) Integer studentNo,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getGridData(studentNo, status, page, size));
    }

    @GetMapping("/next-test-no")
    public ResponseEntity<Integer> getNextTestNo(
            @RequestParam Integer studentNo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate testDate) {
        return ResponseEntity.ok(service.getNextTestNo(studentNo, testDate));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<String>> getCourses() {
        return ResponseEntity.ok(service.getCourses());
    }

    @GetMapping("/course-details")
    public ResponseEntity<List<CourseDetDTO>> getCourseDetails(@RequestParam String courseId) {
        return ResponseEntity.ok(service.getCourseTopics(courseId));
    }

    @GetMapping("/evaluators")
    public ResponseEntity<List<Map<String, Object>>> getEvaluators() {
        return ResponseEntity.ok(service.getEvaluators());
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentSearchDTO>> searchStudents(@RequestParam(defaultValue = "") String query) {
        return ResponseEntity.ok(service.searchStudents(query));
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> create(@RequestBody TestSetupDTO dto, Authentication auth) {
        service.create(dto, extractUsername(auth, dto.getEntryBy()));
        return ResponseEntity.ok(Map.of("message", "Test Setup created successfully!"));
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> update(@RequestBody TestSetupDTO dto, Authentication auth) {
        service.update(dto, extractUsername(auth, dto.getEntryBy()));
        return ResponseEntity.ok(Map.of("message", "Test Setup updated successfully!"));
    }

    private String extractUsername(Authentication auth, String defaultUser) {
        if (defaultUser != null && !defaultUser.isBlank() && !"system".equalsIgnoreCase(defaultUser)) return defaultUser.trim();
        if (auth != null && auth.getPrincipal() != null) {
            String str = auth.getPrincipal().toString();
            Matcher m = Pattern.compile("userName=([^,\\]]+)").matcher(str);
            if (m.find()) return m.group(1).trim();
            return auth.getName();
        }
        return "admin";
    }
}