package com.way2care.inventorymanagement.dto.reports.productionExecution;

import com.way2care.inventorymanagement.model.ProductionStage;
import com.way2care.inventorymanagement.model.ProductionStageStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StageProgressDTO {
    private ProductionStage stage;
    private ProductionStageStatus stageStatus;
    private Integer inputQty;
    private Integer outputQty;
    private Integer balanceQty;
    private LocalDateTime executedAt;
}
