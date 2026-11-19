package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.ProductCostHistoryRequestDTO;
import com.way2care.inventorymanagement.dto.ProductCostHistoryResponseDTO;
import com.way2care.inventorymanagement.service.ProductCostHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-costs")
@RequiredArgsConstructor
public class ProductCostHistoryController {

    private final ProductCostHistoryService productCostHistoryService;

    @GetMapping("/history/{productId}")
    public List<ProductCostHistoryResponseDTO> getCostHistory(@PathVariable Integer productId) {
        return productCostHistoryService.getCostHistoryByProduct(productId);
    }

    @PostMapping("/approve")
    public ProductCostHistoryResponseDTO approveCost(@RequestBody ProductCostHistoryRequestDTO request) {
        return productCostHistoryService.approveCost(request);
    }
}
