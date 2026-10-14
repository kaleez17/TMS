package com.example.lissomsoft.tms.service;

import com.example.lissomsoft.tms.entity.TestSetup;
import com.example.lissomsoft.tms.entity.TestSetupId;
import com.example.lissomsoft.tms.exception.ApiException;
import com.example.lissomsoft.tms.repository.TestSetupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Handles the "Locked" test status.
 *   stat 0 = Scheduled, 1 = Completed, 2 = Locked
 * A locked test goes back to Scheduled (stat 0) after 24 hours.
 */
@Service
@RequiredArgsConstructor
public class TestLockService {

    public static final Duration LOCK_DURATION = Duration.ofHours(24);

    private final TestSetupRepository repo;

    /**
     * Seconds left before a lock expires. Always between 0 and 24 hours,
     * so the screen can never show more than the 24-hour limit.
     */
    public static long remainingSeconds(LocalDateTime lockedAt) {
        long max = LOCK_DURATION.getSeconds();
        if (lockedAt == null) return 0;
        long left = max - Duration.between(lockedAt, LocalDateTime.now()).getSeconds();
        return Math.max(0, Math.min(max, left));
    }

    /** Lock a test (stat = 2) and remember when it was locked. */
    @Transactional
    public void lock(Integer studentNo, String studentId, Integer testNo, LocalDate testDate) {
        TestSetup test = repo.findById(new TestSetupId(studentNo, studentId, testNo, testDate))
                .orElseThrow(() -> ApiException.badRequest("Test setup not found"));

        if ("1".equals(test.getStat())) return;   // already completed - never lock
        if ("2".equals(test.getStat())) return;   // already locked - keep the original lock time

        test.setStat("2");
        test.setLockedAt(LocalDateTime.now());
        repo.save(test);
    }

    /** Admin "Unlock" button: Locked (2) -> Scheduled (0) right away. */
    @Transactional
    public void unlock(Integer studentNo, String studentId, Integer testNo, LocalDate testDate) {
        TestSetup test = repo.findById(new TestSetupId(studentNo, studentId, testNo, testDate))
                .orElseThrow(() -> ApiException.badRequest("Test setup not found"));

        if (!"2".equals(test.getStat())) return;  // not locked (e.g. already auto-released) - nothing to do

        test.setStat("0");
        test.setLockedAt(null);
        repo.save(test);
    }

    /** Locked for 24h or more -> stat = 0 (Scheduled). Returns how many tests were released. */
    @Transactional
    public int releaseExpiredLocks() {
        return repo.releaseExpiredLocks(LocalDateTime.now().minus(LOCK_DURATION));
    }
}
