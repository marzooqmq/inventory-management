package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.BoxStockRequestDTO;
import com.way2care.inventorymanagement.dto.BoxStockResponseDTO;
import com.way2care.inventorymanagement.service.BoxStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/box-stocks")
@RequiredArgsConstructor
@Validated
public class BoxStockController {

    private final BoxStockService boxStockService;

    @GetMapping
    public List<BoxStockResponseDTO> getAll() {
        return boxStockService.getAll();
    }

    @GetMapping("/{id}")
    public BoxStockResponseDTO getById(@PathVariable Integer id) {
        return boxStockService.getById(id);
    }

    @PostMapping
    public BoxStockResponseDTO create(@Valid @RequestBody BoxStockRequestDTO request) {
        return boxStockService.create(request);
    }

    @PutMapping("/{id}")
    public BoxStockResponseDTO update(@PathVariable Integer id, @Valid @RequestBody BoxStockRequestDTO request) {
        return boxStockService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        boxStockService.delete(id);
        return ResponseEntity.ok("Box Stock deleted successfully");
    }
}
