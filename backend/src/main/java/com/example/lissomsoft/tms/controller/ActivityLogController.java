package com.example.lissomsoft.tms.controller;

import com.example.lissomsoft.tms.dto.ActivityLogResponse;
import com.example.lissomsoft.tms.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public List<ActivityLogResponse> getAllActivityLogs() {
        return activityLogService.getAllActivityLogs();
    }
}