package com.way2care.inventorymanagement.dto.reports.costVsProfit;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CostProfitMonthlySummaryDTO {
    private BigDecimal totalRevenue;
    private BigDecimal totalCost;
    private BigDecimal totalProfit;
    private BigDecimal overallMarginPercent;
}
