package com.way2care.inventorymanagement.dto.reports.productionVsSales;

import java.time.LocalDate;

public interface ProductionVsSalesMonthlyProjection {
    Integer getProductId();
    String getProductName();
    String getYearMonth();

    Long getProducedQty();
    Long getSoldQty();
    Long getNetQty();
    Long getCumulativeStock();
}
