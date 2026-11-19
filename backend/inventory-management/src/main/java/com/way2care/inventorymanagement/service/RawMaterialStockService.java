package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.RawMaterialStockRequestDTO;
import com.way2care.inventorymanagement.dto.RawMaterialStockResponseDTO;

import java.util.List;

public interface RawMaterialStockService {
    List<RawMaterialStockResponseDTO> getAll();
    RawMaterialStockResponseDTO getById(Integer id);
    RawMaterialStockResponseDTO create(RawMaterialStockRequestDTO request);
    RawMaterialStockResponseDTO update(Integer id, RawMaterialStockRequestDTO request);
    void delete(Integer id);
}
