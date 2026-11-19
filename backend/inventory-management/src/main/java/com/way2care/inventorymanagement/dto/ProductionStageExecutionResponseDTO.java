package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.ProductionStage;
import com.way2care.inventorymanagement.model.ProductionStageStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProductionStageExecutionResponseDTO {
    private Integer id;
    private Integer productionOrderId;
    private ProductionStage stage;
    private Integer inputQty;
    private Integer outputQty;
    private Integer balanceQty;
    private ProductionStageStatus status;
    private LocalDateTime executedAt;
}
