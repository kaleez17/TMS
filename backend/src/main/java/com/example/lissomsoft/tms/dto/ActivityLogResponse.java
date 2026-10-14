package com.example.lissomsoft.tms.dto;

import java.time.LocalDateTime;

public record ActivityLogResponse(
        String userName,
        String role,
        LocalDateTime loginDateTime,
        String loginStatus,
        LocalDateTime logoutDateTime,
        String activityInfo
) {
}