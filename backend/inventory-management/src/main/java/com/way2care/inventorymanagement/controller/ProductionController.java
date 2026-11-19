package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.ProductionOrderRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionResponseDTO;
import com.way2care.inventorymanagement.service.ProductionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/productions")
@RequiredArgsConstructor
@Validated
public class ProductionController {

    private final ProductionService productionService;

    @GetMapping
    public List<ProductionResponseDTO> getAll() {
        return productionService.getAll();
    }

    @GetMapping("/{id}")
    public ProductionResponseDTO getById(@PathVariable Integer id) {
        return productionService.getById(id);
    }
}
