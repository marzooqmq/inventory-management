package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.RawMaterialStockRequestDTO;
import com.way2care.inventorymanagement.dto.RawMaterialStockResponseDTO;
import com.way2care.inventorymanagement.service.RawMaterialStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/raw-material-stocks")
@RequiredArgsConstructor
@Validated
public class RawMaterialStockController {

    private final RawMaterialStockService rawMaterialStockService;

    @GetMapping
    public List<RawMaterialStockResponseDTO> getAll() { return rawMaterialStockService.getAll(); }

    @GetMapping("/{id}")
    public RawMaterialStockResponseDTO getById(@PathVariable Integer id) { return rawMaterialStockService.getById(id); }

    @PostMapping
    public RawMaterialStockResponseDTO add(@RequestBody @Valid RawMaterialStockRequestDTO request) {
        return rawMaterialStockService.create(request);
    }

    @PutMapping("/{id}")
    public RawMaterialStockResponseDTO update(@PathVariable Integer id, @RequestBody @Valid RawMaterialStockRequestDTO request) {
        return rawMaterialStockService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        rawMaterialStockService.delete(id);
        return ResponseEntity.ok("Raw Material Stocks deleted successfully");
    }
}
