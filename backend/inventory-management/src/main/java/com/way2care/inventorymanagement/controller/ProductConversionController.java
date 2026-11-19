package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.ProductConversionRequestDTO;
import com.way2care.inventorymanagement.dto.ProductConversionResponseDTO;
import com.way2care.inventorymanagement.service.ProductConversionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-conversions")
@RequiredArgsConstructor
public class ProductConversionController {

    private final ProductConversionService productConversionService;

    @GetMapping
    public List<ProductConversionResponseDTO> getAll() { return productConversionService.getAll(); }

    @PostMapping
    public ProductConversionResponseDTO create(@RequestBody ProductConversionRequestDTO request) {
        return productConversionService.create(request);
    }

    @PutMapping("/{id}")
    public ProductConversionResponseDTO update(@PathVariable Integer id, @RequestBody ProductConversionRequestDTO request) {
        return productConversionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        productConversionService.delete(id);
        return ResponseEntity.ok("Product conversion deleted successfully");
    }
}
