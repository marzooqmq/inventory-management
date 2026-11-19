package com.way2care.inventorymanagement.scheduler;

import com.way2care.inventorymanagement.config.SseEmitterManager;
import com.way2care.inventorymanagement.dto.dashboard.DashboardSummaryDTO;
import com.way2care.inventorymanagement.dto.dashboard.LowStockItemDTO;
import com.way2care.inventorymanagement.dto.dashboard.ProductionStageCountDTO;
import com.way2care.inventorymanagement.service.InventoryDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Scheduler to automatically broadcast dashboard updates to SSE clients
 * Runs every 30 seconds to push fresh data
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DashboardUpdateScheduler {

    private final InventoryDashboardService dashboardService;
    private final SseEmitterManager sseEmitterManager;
    private final CacheManager cacheManager;

    /**
     * Evict sales dashboard cache every 5 minutes so data stays fresh
     */
    @Scheduled(fixedDelay = 300_000, initialDelay = 300_000)
    public void evictSalesDashboardCache() {
        try {
            var cache = cacheManager.getCache("salesDashboard");
            if (cache != null) {
                cache.clear();
                log.debug("Sales dashboard cache evicted");
            }
        } catch (Exception e) {
            log.error("Error evicting sales dashboard cache", e);
        }
    }

    /**
     * Broadcast summary updates every 30 seconds
     */
    @Scheduled(fixedDelay = 30000, initialDelay = 5000) // 30 seconds
    public void broadcastSummaryUpdate() {
        int emitterCount = sseEmitterManager.getEmitterCount("inventory-dashboard");
        
        if (emitterCount == 0) {
            return; // Skip if no clients connected
        }

        try {
            log.debug("Broadcasting dashboard summary update to {} clients", emitterCount);
            DashboardSummaryDTO summary = dashboardService.getSummary();
            sseEmitterManager.sendEvent("inventory-dashboard", "summary-update", summary);
        } catch (Exception e) {
            log.error("Error broadcasting summary update", e);
        }
    }

    /**
     * Broadcast production stage updates every 15 seconds
     */
    @Scheduled(fixedDelay = 15000, initialDelay = 7000) // 15 seconds
    public void broadcastStageUpdate() {
        int emitterCount = sseEmitterManager.getEmitterCount("inventory-dashboard");
        
        if (emitterCount == 0) {
            return;
        }

        try {
            log.debug("Broadcasting production stage update to {} clients", emitterCount);
            ProductionStageCountDTO stageCount = dashboardService.getProductionStageCount();
            sseEmitterManager.sendEvent("inventory-dashboard", "stage-update", stageCount);
        } catch (Exception e) {
            log.error("Error broadcasting stage update", e);
        }
    }

    /**
     * Broadcast low stock alerts every 60 seconds
     */
    @Scheduled(fixedDelay = 60000, initialDelay = 10000) // 60 seconds
    public void broadcastLowStockUpdate() {
        int emitterCount = sseEmitterManager.getEmitterCount("inventory-dashboard");
        
        if (emitterCount == 0) {
            return;
        }

        try {
            log.debug("Broadcasting low stock update to {} clients", emitterCount);
            List<LowStockItemDTO> lowStock = dashboardService.getLowStockItems();
            sseEmitterManager.sendEvent("inventory-dashboard", "low-stock-update", lowStock);
        } catch (Exception e) {
            log.error("Error broadcasting low stock update", e);
        }
    }
}
