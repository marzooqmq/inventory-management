package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.BOMRequestDTO;
import com.way2care.inventorymanagement.dto.BOMResponseDTO;

import java.util.List;

public interface BillOfMaterialService {
    List<BOMResponseDTO> getAll();
    BOMResponseDTO getById(Integer id);
    BOMResponseDTO create(BOMRequestDTO request);
    BOMResponseDTO update(Integer id, BOMResponseDTO request);
    void delete(Integer id);

    List<BOMResponseDTO> createAll(List<BOMRequestDTO> request);
}
