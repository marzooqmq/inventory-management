package com.way2care.inventorymanagement.dto.reports.productionVsSales;

public interface ProductionVsSalesReportProjection {
    Integer getProductId();
    String getProductName();
    Long getProducedQty();
    Long getSoldQty();
    Long getClosingStock();
}
