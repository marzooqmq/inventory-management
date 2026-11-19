package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.ProductionRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.Production;
import com.way2care.inventorymanagement.model.ProductionOrder;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.repository.ProductionOrderRepository;
import com.way2care.inventorymanagement.repository.ProductionRepository;
import com.way2care.inventorymanagement.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionServiceImpl implements ProductionService {

    private final ProductionRepository productionRepository;
    private final ProductionOrderRepository productionOrderRepository;
    private final ProductRepository productRepository;

    @Override
    public List<ProductionResponseDTO> getAll() {
        return productionRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public ProductionResponseDTO getById(Integer id) {
        Production production = productionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production not found"));
        return toResponse(production);
    }

    private ProductionResponseDTO toResponse(Production production) {
        return ProductionResponseDTO.builder()
                .id(production.getId())
                .productionOrderId(production.getProductionOrder().getId())
                .productName(production.getProduct().getName())
                .quantityProduced(production.getQuantityProduced())
                .timestamp(production.getTimestamp())
                .build();
    }
}
