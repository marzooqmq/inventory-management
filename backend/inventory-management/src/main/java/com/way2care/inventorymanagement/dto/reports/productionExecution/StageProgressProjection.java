package com.way2care.inventorymanagement.dto.reports.productionExecution;

import com.way2care.inventorymanagement.model.ProductionStage;
import com.way2care.inventorymanagement.model.ProductionStageStatus;

import java.time.LocalDateTime;

public interface StageProgressProjection {
    Integer getProductionOrderId();
    String getProductName();
    ProductionStage getStage();
    ProductionStageStatus getStageStatus();
    Integer getInputQty();
    Integer getOutputQty();
    Integer getBalanceQty();
    LocalDateTime getExecutedAt();
}
