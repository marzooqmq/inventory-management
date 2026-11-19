package com.way2care.inventorymanagement.dto.reports.costVsProfit;

import java.math.BigDecimal;

public interface CostProfitMonthlyReportProjection {
    Integer getProductId();
    String getProductName();
    String getYearMonth();

    Long getProducedQty();
    Long getSoldQty();
    BigDecimal getRevenue();
    BigDecimal getCostPerBox();
    BigDecimal getTotalCost();
    BigDecimal getProfit();
    BigDecimal getMarginPercent();
}
