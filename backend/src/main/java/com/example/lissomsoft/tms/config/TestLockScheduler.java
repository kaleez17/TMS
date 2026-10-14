package com.example.lissomsoft.tms.config;

import com.example.lissomsoft.tms.service.TestLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/** Every 30 seconds: move tests that stayed Locked for 24 hours back to Scheduled. */
@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class TestLockScheduler {

    private final TestLockService lockService;

    @Scheduled(fixedDelay = 30_000, initialDelay = 10_000)
    public void releaseExpiredLocks() {
        lockService.releaseExpiredLocks();
    }
}
