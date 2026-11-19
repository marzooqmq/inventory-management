package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.ProductionRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionResponseDTO;

import java.util.List;

public interface ProductionService {
    List<ProductionResponseDTO> getAll();
    ProductionResponseDTO getById(Integer id);
}
