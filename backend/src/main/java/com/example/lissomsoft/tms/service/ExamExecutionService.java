package com.example.lissomsoft.tms.service;

import com.example.lissomsoft.tms.dto.ExamAnswerSubmitDTO;
import com.example.lissomsoft.tms.dto.ExamQuestionDTO;
import com.example.lissomsoft.tms.dto.TestQuestionResultDTO;
import com.example.lissomsoft.tms.dto.TestResultDetailsDTO;
import com.example.lissomsoft.tms.dto.TestResultSummaryDTO;
import com.example.lissomsoft.tms.dto.TestSetupDTO;
import com.example.lissomsoft.tms.entity.*;
import com.example.lissomsoft.tms.exception.ApiException;
import com.example.lissomsoft.tms.repository.ActivityLogRepository;
import com.example.lissomsoft.tms.repository.StudentMasterRepository;
import com.example.lissomsoft.tms.repository.TestExecHdrRepository;
import com.example.lissomsoft.tms.repository.TestSetupRepository;
import com.example.lissomsoft.tms.repository.TmsQuestionBankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamExecutionService {

    @Autowired
    private final TestSetupRepository testSetupRepository;
    private final StudentMasterRepository studentMasterRepository;
    private final TestExecHdrRepository testExecHdrRepository;
    private final TmsQuestionBankRepository questionBankRepository;
    private final ActivityLogRepository activityLogRepository;

    @Transactional(readOnly = true)
    public List<TestSetupDTO> getTestsForStudent(String username) {
        String cleanName = (username == null) ? "" : username.trim().toLowerCase();

        List<ActivityLog> logs = activityLogRepository.findByUserNameOrderByLoginDateTimeDesc(cleanName);
        if (logs.isEmpty()) {
            return List.of();
        }

        ActivityLog latestLog = logs.get(0);
        String studentId = latestLog.getUserId();
        Integer studentNo = latestLog.getUserNo();

        // Direct StudentMaster query
        StudentMaster sm = studentMasterRepository.findByStudentIdAndStudentNumber(studentId, studentNo)
                .orElse(null);

        String studentName = (sm != null && sm.getStudentName() != null) ? sm.getStudentName() : username;
        String studyMode = (sm != null && sm.getStudyMode() != null) ? sm.getStudyMode() : "Offline";
        String assignedStaff = (sm != null && sm.getAssignedStaff() != null) ? sm.getAssignedStaff() : "Senior Tech Lead";
        LocalDate joiningDate = (sm != null) ? sm.getJoiningDate() : null;
        Long mobile = (sm != null && sm.getMobileNo() != null) ? sm.getMobileNo() : null;

        List<TestSetup> tests = testSetupRepository.findByStudentNoAndStudentId(studentNo, studentId);

        return tests.stream()
                .filter(t -> t.getDelFlag() != null && "A".equalsIgnoreCase(t.getDelFlag().trim()))
                .map(t -> {
                    TestSetupDTO dto = new TestSetupDTO();
                    dto.setStudentNo(t.getStudentNo());
                    dto.setStudentId(t.getStudentId());
                    dto.setStudentName(studentName);
                    dto.setMobileNo(mobile != null ? String.valueOf(mobile) : t.getMobileNo());
                    dto.setTestNo(t.getTestNo());
                    dto.setTestDate(t.getTestDate());
                    dto.setNoOfQuestions(t.getNoOfQuestions());
                    dto.setTimePerTest(t.getTimePerTest());
                    dto.setCourseId(t.getCourseId());
                    dto.setCourseNo(t.getCourseNo());
                    dto.setLvl(t.getLvl());
                    dto.setTestConductedBy(t.getTestConductedBy());
                    dto.setExecutedDate(t.getExecutedDate());
                    dto.setStat(t.getStat());
                    if ("2".equals(t.getStat())) {
                        dto.setLockRemainingSeconds(TestLockService.remainingSeconds(t.getLockedAt()));
                    }

                    // Additional fields from StudentMaster:
                    dto.setStudyMode(studyMode);
                    dto.setAssignedStaff(assignedStaff);
                    dto.setJoiningDate(joiningDate);

                    return dto;
                })
                .sorted((a, b) -> b.getTestDate().compareTo(a.getTestDate()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExamQuestionDTO> getRandomizedQuestions(String courseId, Integer courseNo, Integer level, Integer limit, Integer timePerTestMinutes) {
        List<TmsQuestionBank> rows = questionBankRepository.findRandomizedExamQuestions(courseId, courseNo, level, limit);
        int totalQuestions = rows.isEmpty() ? 1 : rows.size();
        int safeTimePerTest = (timePerTestMinutes == null || timePerTestMinutes <= 0) ? 10 : timePerTestMinutes;
        int timePerQuestionSec = Math.max(15, (safeTimePerTest * 60) / totalQuestions);

        List<ExamQuestionDTO> result = new ArrayList<>();
        for (TmsQuestionBank q : rows) {
            result.add(new ExamQuestionDTO(
                    q.getQuestionNo(),
                    q.getTopic(),
                    q.getLevels(),
                    q.getQuestion(),
                    q.getOptA(),
                    q.getOptB(),
                    q.getOptC(),
                    q.getOptD(),
                    timePerQuestionSec
            ));
        }
        return result;
    }

    @Transactional
    public void saveAnswer(ExamAnswerSubmitDTO dto, String username) {
        System.out.println("========== [SAVE ANSWER HIT] ==========");
        System.out.println("DTO: " + dto);
        System.out.println("Username: " + username);

        String correctAns = questionBankRepository.findCorrectAnswer(dto.courseId(), dto.courseNo(), dto.questionNo());
        if (correctAns == null) {
            correctAns = "";
        }

        String studAns = dto.selectedAns();
        int score = 0;
        if (studAns != null && !studAns.isBlank()) {
            studAns = studAns.trim().toUpperCase();
            if (studAns.equals(correctAns.trim().toUpperCase())) {
                score = 1;
            }
        } else {
            studAns = null;
        }

        TestExecHdrId id = new TestExecHdrId(
                dto.studentNo(),
                dto.studentId(),
                dto.testNo(),
                dto.testDate(),
                dto.questionNo()
        );

        TestExecHdr exec = testExecHdrRepository.findById(id).orElseGet(() -> {
            TestExecHdr newHdr = new TestExecHdr();
            newHdr.setStudentNo(dto.studentNo());
            newHdr.setStudentId(dto.studentId());
            newHdr.setTestNo(dto.testNo());
            newHdr.setTestDate(dto.testDate());
            newHdr.setQuestionNo(dto.questionNo());
            return newHdr;
        });

        exec.setCourseId(dto.courseId());
        exec.setCourseNo(dto.courseNo());
        exec.setStudAns(studAns);
        exec.setCorrectAns(correctAns.trim().toUpperCase());
        exec.setScore(score);
        exec.setEntryBy(username);
        exec.setEntryDate(LocalDate.now());

        // save()-kku badhila saveAndFlush() — idhu direct-aa DB-kku query push pannidum
        TestExecHdr saved = testExecHdrRepository.saveAndFlush(exec);
        System.out.println(">>> SAVED SUCCESSFUL TO DB! StudentNo: " + saved.getStudentNo() + ", QNo: " + saved.getQuestionNo());
    }
    public void clearPartialAttempt(Integer studentNo, String studentId, Integer testNo, LocalDate testDate) {
        testExecHdrRepository.deleteAttemptRecords(studentNo, studentId, testNo, testDate);
    }

    @Transactional
    public void finalizeExam(Integer studentNo, String studentId, Integer testNo, LocalDate testDate) {
        TestSetupId id = new TestSetupId(studentNo, studentId, testNo, testDate);
        TestSetup test = testSetupRepository.findById(id)
                .orElseThrow(() -> ApiException.badRequest("Test setup not found"));

        // 1. Indha test-kku already student answer panni submit aana questions list
        List<TestExecHdr> answeredRecords = testExecHdrRepository.findByStudentNoAndStudentIdAndTestNoAndTestDate(
                studentNo, studentId, testNo, testDate
        );
        List<Integer> answeredQNos = answeredRecords.stream()
                .map(TestExecHdr::getQuestionNo)
                .toList();

        // 2. Test setup-kku relate aana questions-ah eduthu check panrom
        List<TmsQuestionBank> allTestQuestions = questionBankRepository.findRandomizedExamQuestions(
                test.getCourseId(),
                test.getCourseNo(),
                test.getLvl(),
                test.getNoOfQuestions()
        );

        // 3. Attend pannadha / time mudinju vittu pona questions-ah 0 score pottu insert panrom
        for (TmsQuestionBank q : allTestQuestions) {
            if (!answeredQNos.contains(q.getQuestionNo())) {
                String correctAns = q.getAns() != null ? q.getAns().trim().toUpperCase() : "";

                TestExecHdr unattempted = new TestExecHdr();
                unattempted.setStudentNo(studentNo);
                unattempted.setStudentId(studentId);
                unattempted.setTestNo(testNo);
                unattempted.setTestDate(testDate);
                unattempted.setQuestionNo(q.getQuestionNo());
                unattempted.setCourseId(test.getCourseId());
                unattempted.setCourseNo(test.getCourseNo());
                unattempted.setStudAns(null);           // Student attend pannala
                unattempted.setCorrectAns(correctAns);  // Question bank original answer
                unattempted.setScore(0);                // 0 Score
                unattempted.setEntryBy(studentId);
                unattempted.setEntryDate(LocalDate.now());

                testExecHdrRepository.save(unattempted);
            }
        }

        // 4. Test setup-ah completed ("1") nu update panrom
        test.setStat("1");
        test.setExecutedDate(LocalDate.now());
        testSetupRepository.save(test);
    }
    @Transactional(readOnly = true)
    public TestResultSummaryDTO getTestResultSummary(Integer studentNo, String studentId, Integer testNo, LocalDate testDate) {
        System.out.println("Fetching summary for sNo=" + studentNo + ", sId=" + studentId + ", tNo=" + testNo + ", date=" + testDate);

        List<TestExecHdr> records = testExecHdrRepository.findByStudentNoAndStudentIdAndTestNoAndTestDate(
                studentNo, studentId, testNo, testDate
        );

        System.out.println("Found records in DB: " + records.size());

        TestSetupId setupId = new TestSetupId(studentNo, studentId, testNo, testDate);
        TestSetup setup = testSetupRepository.findById(setupId).orElse(null);

        int totalAssigned = (setup != null && setup.getNoOfQuestions() != null) ? setup.getNoOfQuestions() : records.size();
        if (totalAssigned == 0) totalAssigned = 10;

        // Attended = rows where the student really submitted an answer
        List<TestExecHdr> attended = records.stream()
                .filter(r -> r.getStudAns() != null && !r.getStudAns().trim().isEmpty())
                .toList();
        int attendedCount = attended.size();

        // Score = 1 for every attended question whose answer equals the correct answer
        int score = (int) attended.stream()
                .filter(r -> r.getCorrectAns() != null
                        && r.getStudAns().trim().equalsIgnoreCase(r.getCorrectAns().trim()))
                .count();

        double percentage = (totalAssigned > 0) ? Math.round(((double) score / totalAssigned) * 100.0) : 0.0;
        String status = (percentage >= 60.0) ? "PASSED" : "NEEDS IMPROVEMENT";

        return new TestResultSummaryDTO(
                studentNo,
                studentId,
                testNo,
                testDate,
                setup != null ? setup.getCourseId() : "",
                setup != null ? setup.getCourseNo() : 0,
                totalAssigned,
                attendedCount,
                score,
                percentage,
                status
        );
    }

    /**
     * Question-wise result of one test, built only from the database:
     *  - test_exec_hdr      : the student's answer + the correct answer saved with it
     *  - tms_question_bank  : question text and options
     *
     * Each row shows the original Q.No from the Question Bank.
     * Only ATTENDED questions are returned: rows where the student really submitted an answer.
     * (Rows with an empty stud_ans are the unattempted questions that finalizeExam() inserts with score 0.)
     * Score per question = 1 when the student's answer equals the correct answer, otherwise 0.
     */
    @Transactional(readOnly = true)
    public TestResultDetailsDTO getTestResultDetails(Integer studentNo, String studentId, Integer testNo, LocalDate testDate) {
        List<TestExecHdr> records = testExecHdrRepository.findByStudentNoAndStudentIdAndTestNoAndTestDate(
                studentNo, studentId, testNo, testDate);

        // attended questions only (a real submitted answer), in question order
        List<TestExecHdr> attendedRows = records.stream()
                .filter(r -> r.getStudAns() != null && !r.getStudAns().isBlank())
                .sorted((a, b) -> a.getQuestionNo().compareTo(b.getQuestionNo()))
                .toList();

        // Q.No comes from the Question Bank row
        List<TestQuestionResultDTO> rows = IntStream.range(0, attendedRows.size())
                .mapToObj(i -> {
                    TestExecHdr r = attendedRows.get(i);
                    TmsQuestionBank q = questionBankRepository
                            .findById(new TmsQuestionBankId(r.getCourseId(), r.getCourseNo(), r.getQuestionNo()))
                            .orElse(null);

                    String studAns = r.getStudAns().trim().toUpperCase();

                    // correct answer saved with the attempt; fall back to the question bank if it is empty
                    String correct = (r.getCorrectAns() != null && !r.getCorrectAns().isBlank())
                            ? r.getCorrectAns()
                            : (q != null && q.getAns() != null ? q.getAns() : "");
                    correct = correct.trim().toUpperCase();

                    int score = studAns.equals(correct) ? 1 : 0;

                    return new TestQuestionResultDTO(
                            q != null ? q.getQuestionNo() : r.getQuestionNo(),
                            q != null ? q.getQuestion() : "(question not found)",
                            q != null ? q.getOptA() : null,
                            q != null ? q.getOptB() : null,
                            q != null ? q.getOptC() : null,
                            q != null ? q.getOptD() : null,
                            studAns,
                            correct,
                            score);
                })
                .toList();

        int totalScore = rows.stream().mapToInt(TestQuestionResultDTO::score).sum();

        TestSetup setup = testSetupRepository
                .findById(new TestSetupId(studentNo, studentId, testNo, testDate)).orElse(null);
        int assigned = (setup != null && setup.getNoOfQuestions() != null) ? setup.getNoOfQuestions() : records.size();

        return new TestResultDetailsDTO(assigned, rows.size(), totalScore, rows);
    }
}
