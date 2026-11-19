package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.ProductCostHistoryRequestDTO;
import com.way2care.inventorymanagement.dto.ProductCostHistoryResponseDTO;

import java.util.List;

public interface ProductCostHistoryService {
    ProductCostHistoryResponseDTO approveCost(ProductCostHistoryRequestDTO request);

    List<ProductCostHistoryResponseDTO> getCostHistoryByProduct(Integer productId);
}
