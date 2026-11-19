package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.ProductPriceRequestDTO;
import com.way2care.inventorymanagement.dto.ProductPriceResponseDTO;
import com.way2care.inventorymanagement.service.ProductPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-prices")
@RequiredArgsConstructor
public class ProductPriceController {

    private final ProductPriceService productPriceService;

    @GetMapping
    public List<ProductPriceResponseDTO> getAll() { return productPriceService.getProductPrices(); }

    @PostMapping
    public ProductPriceResponseDTO create(@RequestBody ProductPriceRequestDTO request) {
        return productPriceService.create(request);
    }

    @PutMapping("/{id}")
    public ProductPriceResponseDTO update(@PathVariable Integer id, @RequestBody ProductPriceRequestDTO request) {
        return productPriceService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        productPriceService.delete(id);
        return ResponseEntity.ok("Product Price deleted successfully");
    }
}
