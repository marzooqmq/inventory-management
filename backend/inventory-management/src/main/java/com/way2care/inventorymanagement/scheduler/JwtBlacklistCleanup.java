package com.way2care.inventorymanagement.scheduler;

import com.way2care.inventorymanagement.repository.JwtBlacklistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class JwtBlacklistCleanup {

    private final JwtBlacklistRepository jwtBlacklistRepository;

    @Scheduled(cron = "0 0 * * * *") // Every 1 hour
    public void cleanUpExpiredTokens() {
        jwtBlacklistRepository.deleteExpiredTokens(Instant.now());
    }
}
