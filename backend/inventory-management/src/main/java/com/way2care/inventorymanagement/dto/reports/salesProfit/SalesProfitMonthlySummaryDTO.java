package com.way2care.inventorymanagement.dto.reports.salesProfit;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SalesProfitMonthlySummaryDTO {
    private BigDecimal totalRevenue;
    private BigDecimal totalCost;
    private BigDecimal totalProfit;
    private BigDecimal overallMarginPercent;
}
