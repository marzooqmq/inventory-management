package com.way2care.inventorymanagement.dto.reports.productionExecution;

import com.way2care.inventorymanagement.model.ProductionOrderStatus;

import java.time.LocalDate;

public interface ProductionExecutionReportProjection {

    Integer getProductionOrderId();
    String getProductName();
    Integer getOrderQty();
    Integer getProducedQty();
    ProductionOrderStatus getOrderStatus();
    LocalDate getStartDate();
    LocalDate getEndDate();
}
