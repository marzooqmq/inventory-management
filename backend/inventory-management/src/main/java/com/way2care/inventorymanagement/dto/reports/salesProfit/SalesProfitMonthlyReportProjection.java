package com.way2care.inventorymanagement.dto.reports.salesProfit;

import java.math.BigDecimal;

public interface SalesProfitMonthlyReportProjection {
    Integer getProductId();
    String getProductName();
    String getYearMonth();
    Long getSoldQty();
    BigDecimal getRevenue();
    BigDecimal getTotalCost();
    BigDecimal getProfit();
    BigDecimal getMarginPercent();
}
