package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.StockTransactionResponseDTO;

import java.util.List;

public interface StockTransactionService {
    List<StockTransactionResponseDTO> getAll();
    StockTransactionResponseDTO getById(Integer id);
    void delete(Integer id);
}
