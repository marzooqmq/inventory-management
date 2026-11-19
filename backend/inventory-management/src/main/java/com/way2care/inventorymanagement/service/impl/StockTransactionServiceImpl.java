package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.StockTransactionResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.StockTransaction;
import com.way2care.inventorymanagement.repository.StockTransactionRepository;
import com.way2care.inventorymanagement.service.StockTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockTransactionServiceImpl implements StockTransactionService{

    private final StockTransactionRepository stockTransactionRepository;

    @Override
    public List<StockTransactionResponseDTO> getAll() {
        return stockTransactionRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public StockTransactionResponseDTO getById(Integer id) {
        StockTransaction transaction = stockTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock transaction not found"));
        return toResponse(transaction);
    }

    @Override
    public void delete(Integer id) {
        StockTransaction transaction = stockTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock transaction not found"));
        stockTransactionRepository.delete(transaction);
    }

    private StockTransactionResponseDTO toResponse(StockTransaction transaction) {
        return StockTransactionResponseDTO.builder()
                .type(transaction.getType())
                .itemType(transaction.getItemType())
                .itemId(transaction.getItemId())
                .quantity(transaction.getQuantity())
                .module(transaction.getModule())
                .moduleId(transaction.getModuleId())
                .timestamp(transaction.getTimestamp())
                .build();
    }
}
