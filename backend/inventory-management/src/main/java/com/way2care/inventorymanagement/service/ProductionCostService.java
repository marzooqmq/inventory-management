package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.ProductionCostRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionCostResponseDTO;

import java.util.List;

public interface ProductionCostService {
    List<ProductionCostResponseDTO> getAll();
    ProductionCostResponseDTO getById(Integer id);
    ProductionCostResponseDTO create(ProductionCostRequestDTO request);
    ProductionCostResponseDTO update(Integer id, ProductionCostRequestDTO request);
    void delete(Integer id);
}
