package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.ProductRequestDTO;
import com.way2care.inventorymanagement.dto.ProductResponseDTO;
import com.way2care.inventorymanagement.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Validated
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRODUCTION_MANAGER')")
    public List<ProductResponseDTO> getAll() { return productService.getAll(); }

    @GetMapping("/{id}")
    public ProductResponseDTO getById(@PathVariable Integer id) { return productService.getById(id); }

    @PostMapping
    public ProductResponseDTO add(@Valid @RequestBody ProductRequestDTO request) {
        return productService.create(request);
    }

    @PutMapping("/{id}")
    public ProductResponseDTO update(@PathVariable Integer id, @Valid @RequestBody ProductRequestDTO request) {
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        productService.delete(id);
        return ResponseEntity.ok("Product deleted successfully");
    }
}
