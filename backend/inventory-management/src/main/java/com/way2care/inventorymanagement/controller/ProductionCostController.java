package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.ProductionCostRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionCostResponseDTO;
import com.way2care.inventorymanagement.model.ProductionCost;
import com.way2care.inventorymanagement.service.ProductionCostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/production-costs")
@RequiredArgsConstructor
@Validated
public class ProductionCostController {

    private final ProductionCostService productionCostService;

    @GetMapping
    public List<ProductionCostResponseDTO> getAll() {
        return productionCostService.getAll();
    }

    @GetMapping("/{id}")
    public ProductionCostResponseDTO getById(@PathVariable Integer id) {
        return productionCostService.getById(id);
    }

    @PostMapping
    public ProductionCostResponseDTO add(@Valid @RequestBody ProductionCostRequestDTO request) {
        return productionCostService.create(request);
    }

    @PutMapping("/{id}")
    public ProductionCostResponseDTO update(@PathVariable Integer id,
                                            @Valid @RequestBody ProductionCostRequestDTO request) {
        return productionCostService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        productionCostService.delete(id);
        return ResponseEntity.ok("Production cost record deleted successfully.");
    }
}
