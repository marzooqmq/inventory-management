package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.dashboard.*;

import java.time.LocalDate;
import java.util.List;

public interface InventoryDashboardService {
    DashboardSummaryDTO getSummary();
    StockBreakdownDTO getStockBreakdown();
    List<ProductionDailyDTO> getProductionDaily(LocalDate date);
    ProductionStageCountDTO getProductionStageCount();
    List<LowStockItemDTO> getLowStockItems();
    List<ProductionTrendDTO> getProductionTrend(int days);
    List<TopProductDTO> getTopProductsByStock(int limit);
    List<TopProductDTO> getTopProductsByQuantity(int limit);
    
    // Priority 2: Material Consumption & Reorder Intelligence
    List<MaterialConsumptionDTO> getMaterialConsumption();
    List<ReorderPointDTO> getReorderPoints();
}
