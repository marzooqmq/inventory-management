package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.ProductionOrderRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionOrderResponseDTO;

import java.util.List;

public interface ProductionOrderService {
    List<ProductionOrderResponseDTO> getAll();
    ProductionOrderResponseDTO getById(Integer id);
    ProductionOrderResponseDTO create(ProductionOrderRequestDTO request);
    ProductionOrderResponseDTO update(Integer id, ProductionOrderRequestDTO request);
    void delete(Integer id);
}
