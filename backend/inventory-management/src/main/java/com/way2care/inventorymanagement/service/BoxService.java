package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.BoxRequestDTO;
import com.way2care.inventorymanagement.dto.BoxResponseDTO;

import java.util.List;

public interface BoxService {
    List<BoxResponseDTO> getAll();
    BoxResponseDTO getById(Integer id);
    BoxResponseDTO create(BoxRequestDTO request);
    BoxResponseDTO update(Integer id, BoxRequestDTO request);
    void delete(Integer id);
}
