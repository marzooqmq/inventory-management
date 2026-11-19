package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.BoxStockRequestDTO;
import com.way2care.inventorymanagement.dto.BoxStockResponseDTO;

import java.util.List;

public interface BoxStockService {
    List<BoxStockResponseDTO> getAll();
    BoxStockResponseDTO getById(Integer id);
    BoxStockResponseDTO create(BoxStockRequestDTO request);
    BoxStockResponseDTO update(Integer id, BoxStockRequestDTO request);
    void delete(Integer id);
}
