package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.RawMaterialUsageRequestDTO;
import com.way2care.inventorymanagement.dto.RawMaterialUsageResponseDTO;

import java.util.List;

public interface RawMaterialUsageService {
    List<RawMaterialUsageResponseDTO> getAll();
    RawMaterialUsageResponseDTO getById(Integer id);
    RawMaterialUsageResponseDTO create(RawMaterialUsageRequestDTO request);
    RawMaterialUsageResponseDTO update(Integer id, RawMaterialUsageRequestDTO request);
    void delete(Integer id);
}
