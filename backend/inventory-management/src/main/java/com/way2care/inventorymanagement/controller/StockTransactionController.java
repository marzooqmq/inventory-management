package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.StockTransactionResponseDTO;
import com.way2care.inventorymanagement.service.StockTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stock-transactions")
@RequiredArgsConstructor
@Validated
public class StockTransactionController {

    private final StockTransactionService service;

    @GetMapping
    public List<StockTransactionResponseDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public StockTransactionResponseDTO getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok("Stock Transaction deleted successfully");
    }
}
