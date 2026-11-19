package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.ProductionStage;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductionStageExecutionRequestDTO {

    @NotNull
    private Integer productionOrderId;

    @NotNull
    private ProductionStage stage;

    private Integer processQty;
}
