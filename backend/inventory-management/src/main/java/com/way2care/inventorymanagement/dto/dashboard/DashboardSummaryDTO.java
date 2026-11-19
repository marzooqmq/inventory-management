package com.way2care.inventorymanagement.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    private Long totalProducts;
    private Long activeProducts;
    private BigDecimal totalStockValue;
    private Long lowStockItemsCount;
    private Long activeProductionOrders;
    private Long pendingInvoices;
    private BigDecimal todaySalesValue;
    private Long todaySalesCount;
}
