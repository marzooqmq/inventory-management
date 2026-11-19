package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.RawMaterialRequestDTO;
import com.way2care.inventorymanagement.dto.RawMaterialResponseDTO;

import java.util.List;

public interface RawMaterialService {
    List<RawMaterialResponseDTO> getAll();
    RawMaterialResponseDTO getById(Integer id);
    RawMaterialResponseDTO create(RawMaterialRequestDTO request);
    RawMaterialResponseDTO update(Integer id, RawMaterialRequestDTO request);
    void delete(Integer id);
}
