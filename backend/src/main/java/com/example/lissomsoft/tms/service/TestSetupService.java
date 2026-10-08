package com.example.lissomsoft.tms.service;

import com.example.lissomsoft.tms.dto.*;
import com.example.lissomsoft.tms.entity.TestSetup;
import com.example.lissomsoft.tms.entity.TestSetupId;
import com.example.lissomsoft.tms.repository.TestSetupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TestSetupService {

    private final TestSetupRepository repo;
    private final JdbcTemplate jdbc;

    @Transactional(readOnly = true)
    public Page<TestSetupDTO> getGridData(Integer studentNo, String status, int page, int size) {
        StringBuilder sql = new StringBuilder(
                "SELECT ts.Student_No, ts.student_id, sm.student_name, ts.mobile_no, ts.Test_no, ts.Test_Date, " +
                        "ts.course_id, ts.Course_No, cd.Tech AS topic_name, ts.Lvl, ts.test_conducted_by, " +
                        "COALESCE(tm.trxn_description, tm.trxn_master_name) AS evaluator_name, " +
                        "ts.Executed_date, ts.stat, ts.entry_by, ts.Entry_date, ts.del_flag, " +
                        "ts.no_of_questions, ts.time_per_test " +
                        "FROM test_setup ts " +
                        "LEFT JOIN student_master sm ON ts.Student_No = sm.student_no AND ts.student_id = sm.student_id " +
                        "LEFT JOIN course_det cd ON ts.course_id = cd.Course_ID AND ts.Course_No = cd.Course_DET_ID " +
                        "LEFT JOIN trxn_master tm ON CONCAT(tm.trxn_master_id, tm.trxn_master_num) = ts.test_conducted_by " +
                        "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (studentNo != null) {
            sql.append(" AND ts.Student_No = ? ");
            params.add(studentNo);
        }
        if ("ACTIVE".equalsIgnoreCase(status)) {
            sql.append(" AND (ts.del_flag = 'A' OR ts.del_flag IS NULL) ");
        } else if ("INACTIVE".equalsIgnoreCase(status)) {
            sql.append(" AND ts.del_flag = 'D' ");
        }

        String countSql = "SELECT COUNT(*) FROM (" + sql.toString() + ") AS total_count";
        Integer total = jdbc.queryForObject(countSql, Integer.class, params.toArray());

        sql.append(" ORDER BY ts.Test_Date DESC, ts.Test_no DESC LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        List<TestSetupDTO> list = jdbc.query(sql.toString(), (rs, rowNum) -> {
            TestSetupDTO dto = new TestSetupDTO();
            dto.setStudentNo(rs.getInt("Student_No"));
            dto.setStudentId(rs.getString("student_id"));
            dto.setStudentName(rs.getString("student_name"));
            dto.setMobileNo(rs.getString("mobile_no"));
            dto.setTestNo(rs.getInt("Test_no"));
            dto.setTestDate(rs.getDate("Test_Date") != null ? rs.getDate("Test_Date").toLocalDate() : null);
            dto.setCourseId(rs.getString("course_id"));
            dto.setCourseNo(rs.getInt("Course_No"));
            dto.setTopicName(rs.getString("topic_name"));
            dto.setLvl(rs.getInt("Lvl"));

            dto.setNoOfQuestions(rs.getInt("no_of_questions"));
            dto.setTimePerTest(rs.getInt("time_per_test"));

            dto.setTestConductedBy(rs.getString("test_conducted_by"));
            dto.setEvaluatorName(rs.getString("evaluator_name"));
            dto.setExecutedDate(rs.getDate("Executed_date") != null ? rs.getDate("Executed_date").toLocalDate() : null);
            dto.setStat(rs.getString("stat"));
            dto.setEntryBy(rs.getString("entry_by"));
            dto.setEntryDate(rs.getDate("Entry_date") != null ? rs.getDate("Entry_date").toLocalDate() : null);
            dto.setDelFlag(rs.getString("del_flag"));
            return dto;
        }, params.toArray());

        return new PageImpl<>(list, PageRequest.of(page, size), total != null ? total : 0);
    }

    @Transactional(readOnly = true)
    public Integer getNextTestNo(Integer studentNo, LocalDate testDate) {
        if (studentNo == null || testDate == null) return 1;
        return repo.getNextTestNoForStudentAndDate(studentNo, testDate);
    }

    @Transactional
    public void create(TestSetupDTO dto, String currentUser) {
        // Enforce autoincrement based on student and date on backend
        int nextNo = repo.getNextTestNoForStudentAndDate(dto.getStudentNo(), dto.getTestDate());
        dto.setTestNo(nextNo);

        TestSetup entity = new TestSetup();
        BeanUtils.copyProperties(dto, entity);
        entity.setEntryBy(currentUser);
        entity.setEntryDate(LocalDate.now());
        entity.setStat("0");
        entity.setDelFlag(dto.getDelFlag() != null ? dto.getDelFlag() : "A");
        repo.save(entity);
    }

    @Transactional
    public void update(TestSetupDTO dto, String currentUser) {
        TestSetupId id = new TestSetupId(dto.getStudentNo(), dto.getStudentId(), dto.getTestNo(), dto.getTestDate());
        TestSetup entity = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found for update!"));

        entity.setCourseId(dto.getCourseId());
        entity.setCourseNo(dto.getCourseNo());
        entity.setLvl(dto.getLvl());
        entity.setTestConductedBy(dto.getTestConductedBy());
        entity.setDelFlag(dto.getDelFlag());

        entity.setNoOfQuestions(dto.getNoOfQuestions());
        entity.setTimePerTest(dto.getTimePerTest());

        repo.save(entity);
    }

    @Transactional(readOnly = true)
    public List<String> getCourses() {
        return jdbc.queryForList("SELECT ID FROM course_master WHERE del_flg = 'A' OR del_flg IS NULL ORDER BY ID", String.class);
    }

    // In TestSetupService.java:

    @Transactional(readOnly = true)
    public List<CourseDetDTO> getCourseTopics(String courseId) {
        // cd.Tech-ah dto.topic field-ku map panrom
        String sql = "SELECT Course_ID, Course_DET_ID, Tech " +
                "FROM course_det " +
                "WHERE Course_ID = ? AND (del_flg = 'A' OR del_flg IS NULL) " +
                "ORDER BY Course_DET_ID";
        return jdbc.query(sql, (rs, rowNum) -> new CourseDetDTO(
                rs.getString("Course_ID"),
                rs.getInt("Course_DET_ID"),
                rs.getString("Tech") // Tech data mapped here
        ), courseId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEvaluators() {
        String sql = "SELECT CONCAT(trxn_master_id, trxn_master_num) AS id, " +
                "COALESCE(trxn_description, trxn_master_name) AS trxnName " +
                "FROM trxn_master WHERE trxn_master_id = 'EV' AND (del_flg = 'A' OR del_flg IS NULL)";
        return jdbc.queryForList(sql);
    }

    @Transactional(readOnly = true)
    public List<StudentSearchDTO> searchStudents(String query) {
        if (query == null || query.trim().isEmpty()) return List.of();
        String sql = "SELECT student_no, student_id, student_name, CAST(mobile_no AS CHAR) AS mobile_no " +
                "FROM student_master WHERE (LOWER(student_name) LIKE LOWER(CONCAT('%', ?, '%')) " +
                "OR LOWER(student_id) LIKE LOWER(CONCAT('%', ?, '%'))) AND (del_flg = 'A' OR del_flg IS NULL) LIMIT 15";
        return jdbc.query(sql, (rs, rowNum) -> new StudentSearchDTO(
                rs.getInt("student_no"),
                rs.getString("student_id"),
                rs.getString("student_name"),
                rs.getString("mobile_no")
        ), query.trim(), query.trim());
    }
}