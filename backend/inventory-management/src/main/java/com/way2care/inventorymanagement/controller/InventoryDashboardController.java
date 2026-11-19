package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.config.SseEmitterManager;
import com.way2care.inventorymanagement.dto.dashboard.*;
import com.way2care.inventorymanagement.service.InventoryDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/inventory-dashboard")
@RequiredArgsConstructor
@Validated
@Slf4j
public class InventoryDashboardController {

    private final InventoryDashboardService dashboardService;
    private final SseEmitterManager sseEmitterManager;

    /**
     * Get dashboard summary with key metrics
     */
    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRODUCTION_MANAGER')")
    public ResponseEntity<DashboardSummaryDTO> getSummary() {
        log.info("Fetching dashboard summary");
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    /**
     * Get stock breakdown by type
     */
    @GetMapping("/stock-breakdown")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRODUCTION_MANAGER')")
    public ResponseEntity<StockBreakdownDTO> getStockBreakdown() {
        log.info("Fetching stock breakdown");
        return ResponseEntity.ok(dashboardService.getStockBreakdown());
    }

    /**
     * Get daily production data
     * @param date Production date (defaults to today)
     */
    @GetMapping("/production-daily")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRODUCTION_MANAGER')")
    public ResponseEntity<List<ProductionDailyDTO>> getProductionDaily(
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        LocalDate targetDate = date != null ? date : LocalDate.now();
        log.info("Fetching production data for date: {}", targetDate);
        
        return ResponseEntity.ok(dashboardService.getProductionDaily(targetDate));
    }

    /**
     * Get production stage counts
     */
    @GetMapping("/production-stages")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRODUCTION_MANAGER')")
    public ResponseEntity<ProductionStageCountDTO> getProductionStageCount() {
        log.info("Fetching production stage counts");
        return ResponseEntity.ok(dashboardService.getProductionStageCount());
    }

    /**
     * Get low stock items
     */
    @GetMapping("/low-stock-items")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRODUCTION_MANAGER')")
    public ResponseEntity<List<LowStockItemDTO>> getLowStockItems() {
        log.info("Fetching low stock items");
        return ResponseEntity.ok(dashboardService.getLowStockItems());
    }

    /**
     * Get production trend over specified days
     * @param days Number of days (defaults to 7)
     */
    @GetMapping("/production-trend")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRODUCTION_MANAGER')")
    public ResponseEntity<List<ProductionTrendDTO>> getProductionTrend(
            @RequestParam(defaultValue = "7") int days) {
        
        log.info("Fetching production trend for {} days", days);
        return ResponseEntity.ok(dashboardService.getProductionTrend(days));
    }

    /**
     * Get top products by stock value
     * @param limit Number of products (defaults to 10)
     */
    @GetMapping("/top-products")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRODUCTION_MANAGER')")
    public ResponseEntity<List<TopProductDTO>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Fetching top {} products by stock value", limit);
        return ResponseEntity.ok(dashboardService.getTopProductsByStock(limit));
    }

    /**
     * Get top products by stock quantity
     * @param limit Number of products (defaults to 10)
     */
    @GetMapping("/top-products-by-quantity")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRODUCTION_MANAGER')")
    public ResponseEntity<List<TopProductDTO>> getTopProductsByQuantity(
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Fetching top {} products by stock quantity", limit);
        return ResponseEntity.ok(dashboardService.getTopProductsByQuantity(limit));
    }

    /**
     * SSE endpoint for real-time dashboard updates
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRODUCTION_MANAGER')")
    public SseEmitter streamDashboardUpdates() {
        log.info("Client connected to dashboard SSE stream");
        return sseEmitterManager.addEmitter("inventory-dashboard");
    }

    /**
     * Manual trigger to broadcast dashboard update (for testing or on-demand refresh)
     * In production, this would be triggered automatically when data changes
     */
    @PostMapping("/broadcast-update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> broadcastUpdate() {
        log.info("Broadcasting dashboard update to all connected clients");
        
        DashboardSummaryDTO summary = dashboardService.getSummary();
        sseEmitterManager.sendEvent("inventory-dashboard", "summary-update", summary);
        
        ProductionStageCountDTO stageCount = dashboardService.getProductionStageCount();
        sseEmitterManager.sendEvent("inventory-dashboard", "stage-update", stageCount);
        
        List<LowStockItemDTO> lowStock = dashboardService.getLowStockItems();
        sseEmitterManager.sendEvent("inventory-dashboard", "low-stock-update", lowStock);
        
        return ResponseEntity.ok("Update broadcasted to " + 
                sseEmitterManager.getEmitterCount("inventory-dashboard") + " clients");
    }

    /**
     * Get material consumption rates
     */
    @GetMapping("/material-consumption")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRODUCTION_MANAGER')")
    public ResponseEntity<List<MaterialConsumptionDTO>> getMaterialConsumption() {
        log.info("Fetching material consumption data");
        return ResponseEntity.ok(dashboardService.getMaterialConsumption());
    }

    /**
     * Get reorder point recommendations
     */
    @GetMapping("/reorder-points")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRODUCTION_MANAGER')")
    public ResponseEntity<List<ReorderPointDTO>> getReorderPoints() {
        log.info("Fetching reorder point recommendations");
        return ResponseEntity.ok(dashboardService.getReorderPoints());
    }
}
