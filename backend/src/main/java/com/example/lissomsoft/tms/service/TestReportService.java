package com.example.lissomsoft.tms.service;

import com.example.lissomsoft.tms.dto.TestReportSummaryDTO;
import com.example.lissomsoft.tms.dto.TestSetupDTO;
import com.example.lissomsoft.tms.entity.TestSetupId;
import com.example.lissomsoft.tms.exception.ApiException;
import com.example.lissomsoft.tms.repository.TestSetupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Read-only service behind the Test Report Dashboard.
 * Everything is read from the existing test_setup table (+ the same joins the
 * Test Setup grid already uses), so no new table or entity is needed.
 */
@Service
@RequiredArgsConstructor
public class TestReportService {

    private final TestSetupRepository repo;
    private final JdbcTemplate jdbc;
    private final TestLockService lockService;

    @Transactional
    public TestReportSummaryDTO summary() {
        lockService.releaseExpiredLocks();   // make sure expired locks are already Scheduled
        return new TestReportSummaryDTO(
                repo.count(),
                repo.countCompleted(),
                repo.countScheduled(),
                repo.countLocked());
    }

    @Transactional
    public List<TestSetupDTO> details(String category, String name, Integer studentNo) {
        lockService.releaseExpiredLocks();

        String cat = category == null ? "ALLOCATED" : category.trim().toUpperCase();

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
                "WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        // Same definitions as the summary counts above (stat: 0 Scheduled, 1 Completed, 2 Locked)
        switch (cat) {
            case "ALLOCATED" -> { /* no extra filter: every test */ }
            case "SCHEDULED" -> sql.append(" AND (ts.stat IS NULL OR ts.stat = '0') ");
            case "COMPLETED" -> sql.append(" AND ts.stat = '1' ");
            case "LOCKED" -> sql.append(" AND ts.stat = '2' ");
            default -> throw ApiException.badRequest("Invalid category: " + category);
        }

        if (name != null && !name.isBlank()) {
            sql.append(" AND (LOWER(sm.student_name) LIKE LOWER(CONCAT('%', ?, '%')) ")
               .append("OR LOWER(ts.student_id) LIKE LOWER(CONCAT('%', ?, '%'))) ");
            params.add(name.trim());
            params.add(name.trim());
        }
        if (studentNo != null) {
            sql.append(" AND ts.Student_No = ? ");
            params.add(studentNo);
        }
        sql.append(" ORDER BY ts.Test_Date DESC, ts.Test_no DESC");

        List<TestSetupDTO> rows = jdbc.query(sql.toString(), (rs, rowNum) -> {
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

        // Locked rows: remaining time comes from the entity (same timezone handling as when it was locked)
        for (TestSetupDTO dto : rows) {
            if ("2".equals(dto.getStat())) {
                repo.findById(new TestSetupId(dto.getStudentNo(), dto.getStudentId(), dto.getTestNo(), dto.getTestDate()))
                    .ifPresent(t -> dto.setLockRemainingSeconds(TestLockService.remainingSeconds(t.getLockedAt())));
            }
        }
        return rows;
    }
}
