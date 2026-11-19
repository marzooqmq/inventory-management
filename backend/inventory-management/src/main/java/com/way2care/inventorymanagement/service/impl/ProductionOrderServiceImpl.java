package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.ProductionOrderRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionOrderResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.ProductionOrder;
import com.way2care.inventorymanagement.model.ProductionOrderStatus;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.repository.ProductionOrderRepository;
import com.way2care.inventorymanagement.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionOrderServiceImpl implements ProductionOrderService {

    private final ProductionOrderRepository productionOrderRepository;
    private final ProductRepository productRepository;

    @Override
    public List<ProductionOrderResponseDTO> getAll() {
        return productionOrderRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public ProductionOrderResponseDTO getById(Integer id) {
        return productionOrderRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Production Order not found"));
    }

    @Override
    public ProductionOrderResponseDTO create(ProductionOrderRequestDTO request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductionOrder order = ProductionOrder.builder()
                .product(product)
                .quantity(request.getQuantity())
                .status(ProductionOrderStatus.CREATED)
                .startDate(LocalDate.now())
                .build();
        ProductionOrder saved = productionOrderRepository.save(order);
        return toResponse(saved);
    }

    @Override
    public ProductionOrderResponseDTO update(Integer id, ProductionOrderRequestDTO request) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production Order not found"));

        if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            order.setProduct(product);
        }

        if (request.getQuantity() != null) {
            order.setQuantity(request.getQuantity());
        }

        productionOrderRepository.save(order);
        return toResponse(order);
    }

    @Override
    public void delete(Integer id) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production Order not found"));
        productionOrderRepository.delete(order);
    }

    private ProductionOrderResponseDTO toResponse(ProductionOrder order) {
        return ProductionOrderResponseDTO.builder()
                .id(order.getId())
                .productName(order.getProduct().getName())
                .quantity(order.getQuantity())
                .startDate(order.getStartDate())
                .endDate(order.getEndDate())
                .status(order.getStatus())
                .build();
    }
}