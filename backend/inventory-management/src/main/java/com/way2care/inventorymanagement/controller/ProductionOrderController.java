package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.ProductionOrderRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionOrderResponseDTO;
import com.way2care.inventorymanagement.dto.ProductionRequestDTO;
import com.way2care.inventorymanagement.service.ProductionOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/production-orders")
@RequiredArgsConstructor
@Validated
public class ProductionOrderController {

    private final ProductionOrderService productionOrderService;

    @GetMapping
    public List<ProductionOrderResponseDTO> getAll() {
        return productionOrderService.getAll();
    }

    @GetMapping("/{id}")
    public ProductionOrderResponseDTO getById(@PathVariable Integer id) {
        return productionOrderService.getById(id);
    }

    @PostMapping
    public ProductionOrderResponseDTO add(@Valid @RequestBody ProductionOrderRequestDTO request) {
        return productionOrderService.create(request);
    }

    @PutMapping("/{id}")
    public ProductionOrderResponseDTO update(
            @PathVariable Integer id,
            @Valid @RequestBody ProductionOrderRequestDTO request) {
        return productionOrderService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        productionOrderService.delete(id);
        return ResponseEntity.ok("Production order deleted successfully");
    }
}
