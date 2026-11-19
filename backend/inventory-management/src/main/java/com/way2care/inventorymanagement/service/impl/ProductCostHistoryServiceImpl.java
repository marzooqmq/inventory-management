package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.ProductCostHistoryRequestDTO;
import com.way2care.inventorymanagement.dto.ProductCostHistoryResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.ProductCostHistory;
import com.way2care.inventorymanagement.repository.ProductCostHistoryRepository;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.service.ProductCostHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductCostHistoryServiceImpl implements ProductCostHistoryService {

    private final ProductRepository productRepository;
    private final ProductCostHistoryRepository productCostHistoryRepository;

    @Override
    public ProductCostHistoryResponseDTO approveCost(ProductCostHistoryRequestDTO request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductCostHistory history = ProductCostHistory.builder()
                .product(product)
                .costPerBox(request.getCostPerBox())
                .validFrom(
                        request.getValidFrom() != null ?
                                request.getValidFrom() : LocalDateTime.now())
                .build();

        ProductCostHistory saved = productCostHistoryRepository.save(history);

        product.setCostPrice(request.getCostPerBox());
        product.setCalculatedCostPrice(request.getCostPerBox());
        product.setCostDirty(false);
        product.setCostCalculatedAt(LocalDateTime.now());
        productRepository.save(product);

        return toResponse(saved);
    }

    @Override
    public List<ProductCostHistoryResponseDTO> getCostHistoryByProduct(Integer productId) {
        return productCostHistoryRepository.findByProductIdOrderByValidFromDesc(productId)
                .stream().map(this::toResponse).toList();
    }

    private ProductCostHistoryResponseDTO toResponse(ProductCostHistory history) {
        return ProductCostHistoryResponseDTO.builder()
                .id(history.getId())
                .productId(history.getProduct().getId())
                .productName(history.getProduct().getName())
                .costPerBox(history.getCostPerBox())
                .validFrom(history.getValidFrom())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
