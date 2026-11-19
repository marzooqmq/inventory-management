package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.ProductionStageExecutionRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionStageExecutionResponseDTO;
import com.way2care.inventorymanagement.model.ProductionStage;

import java.util.List;

public interface ProductionStageService {
    ProductionStageExecutionResponseDTO executeProductionStage(ProductionStageExecutionRequestDTO request);
    void cancelProductionStageExecution(Integer productionOrderId, ProductionStage stage);
    List<ProductionStageExecutionResponseDTO> getExecutionsByOrderId(Integer orderId);
}
