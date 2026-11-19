package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.ProductionCostRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionCostResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.ProductionCost;
import com.way2care.inventorymanagement.model.ProductionOrder;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.repository.ProductionCostRepository;
import com.way2care.inventorymanagement.repository.ProductionOrderRepository;
import com.way2care.inventorymanagement.service.ProductService;
import com.way2care.inventorymanagement.service.ProductionCostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionCostServiceImpl implements ProductionCostService {

    private final ProductionCostRepository productionCostRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Override
    public List<ProductionCostResponseDTO> getAll() {
        return productionCostRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public ProductionCostResponseDTO getById(Integer id) {
        ProductionCost cost = productionCostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production Cost not found"));
        return toResponse(cost);
    }

    @Override
    public ProductionCostResponseDTO create(ProductionCostRequestDTO request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductionCost cost = ProductionCost.builder()
                .product(product)
                .labourCost(request.getLabourCost())
                .transportCost(request.getTransportCost())
                .herbalCost(request.getHerbalCost())
                .machineCost(request.getMachineCost())
                .overheadCost(request.getOverheadCost())
                .totalCost(calculateTotal(request))
                .build();
        ProductionCost saved = productionCostRepository.save(cost);
        productService.calculateProductCost(product.getId());
        return toResponse(saved);
    }

    @Override
    public ProductionCostResponseDTO update(Integer id, ProductionCostRequestDTO request) {
        ProductionCost cost = productionCostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production Cost not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        cost.setProduct(product);
        cost.setLabourCost(request.getLabourCost());
        cost.setTransportCost(request.getTransportCost());
        cost.setHerbalCost(request.getHerbalCost());
        cost.setMachineCost(request.getMachineCost());
        cost.setOverheadCost(request.getOverheadCost());
        cost.setTotalCost(calculateTotal(request));
        productionCostRepository.save(cost);
        productService.calculateProductCost(product.getId());
        return toResponse(cost);
    }

    @Override
    public void delete(Integer id) {
        ProductionCost cost = productionCostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production Cost not found"));
        productionCostRepository.delete(cost);
        productService.calculateProductCost(cost.getProduct().getId());
    }

    // Convert to response
    private ProductionCostResponseDTO toResponse(ProductionCost cost) {
        return ProductionCostResponseDTO.builder()
                .id(cost.getId())
                .productId(cost.getProduct().getId())
                .labourCost(cost.getLabourCost())
                .transportCost(cost.getTransportCost())
                .herbalCost(cost.getHerbalCost())
                .machineCost(cost.getMachineCost())
                .overheadCost(cost.getOverheadCost())
                .totalCost(cost.getTotalCost())
                .build();
    }

    //Total Cost Calculation
    private BigDecimal calculateTotal(ProductionCostRequestDTO request) {
        return request.getLabourCost()
                .add(request.getTransportCost())
                .add(request.getHerbalCost())
                .add(request.getMachineCost())
                .add(request.getOverheadCost());
    }
}
