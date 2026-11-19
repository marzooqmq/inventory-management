package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.RawMaterialUsageRequestDTO;
import com.way2care.inventorymanagement.dto.RawMaterialUsageResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.ProductionOrder;
import com.way2care.inventorymanagement.model.RawMaterial;
import com.way2care.inventorymanagement.model.RawMaterialUsage;
import com.way2care.inventorymanagement.repository.ProductionOrderRepository;
import com.way2care.inventorymanagement.repository.RawMaterialRepository;
import com.way2care.inventorymanagement.repository.RawMaterialUsageRepository;
import com.way2care.inventorymanagement.service.RawMaterialUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RawMaterialUsageServiceImpl implements RawMaterialUsageService {

    private final RawMaterialUsageRepository rawMaterialUsageRepository;
    private final ProductionOrderRepository productionOrderRepository;
    private final RawMaterialRepository rawMaterialRepository;

    @Override
    public List<RawMaterialUsageResponseDTO> getAll() {
        return rawMaterialUsageRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public RawMaterialUsageResponseDTO getById(Integer id) {
        RawMaterialUsage usage = rawMaterialUsageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material Usage not found"));
        return toResponse(usage);
    }

    @Override
    public RawMaterialUsageResponseDTO create(RawMaterialUsageRequestDTO request) {

        ProductionOrder order = productionOrderRepository.findById(request.getProductionOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Production Order not found"));

        RawMaterial material = rawMaterialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found"));

        RawMaterialUsage usage = RawMaterialUsage.builder()
                .productionOrder(order)
                .material(material)
                .qtyUsed(request.getQtyUsed())
                .wastage(request.getWastage())
                .build();

        RawMaterialUsage saved = rawMaterialUsageRepository.save(usage);
        return toResponse(saved);
    }

    @Override
    public RawMaterialUsageResponseDTO update(Integer id, RawMaterialUsageRequestDTO request) {
        RawMaterialUsage existing = rawMaterialUsageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material Usage not found"));

        if (request.getProductionOrderId() != null) {
            ProductionOrder order = productionOrderRepository.findById(request.getProductionOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Production order not found"));
            existing.setProductionOrder(order);
        }

        if (request.getMaterialId() != null) {
            RawMaterial material = rawMaterialRepository.findById(request.getMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("Material not found"));
            existing.setMaterial(material);
        }

        if (request.getQtyUsed() != null) {
            existing.setQtyUsed(request.getQtyUsed());
        }

        if (request.getWastage() != null) {
            existing.setWastage(request.getWastage());
        }

        rawMaterialUsageRepository.save(existing);
        return toResponse(existing);
    }

    @Override
    public void delete(Integer id) {
        RawMaterialUsage rawMaterialUsage = rawMaterialUsageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material Usage not found"));
        rawMaterialUsageRepository.delete(rawMaterialUsage);
    }

    private RawMaterialUsageResponseDTO toResponse(RawMaterialUsage usage) {
        return RawMaterialUsageResponseDTO.builder()
                .id(usage.getId())
                .productionOrderId(usage.getId())
                .productionProductName(usage.getProductionOrder().getProduct().getName())
                .materialId(usage.getMaterial().getId())
                .materialName(usage.getMaterial().getName())
                .productionOrderId(usage.getProductionOrder().getId())
                .qtyUsed(usage.getQtyUsed())
                .wastage(usage.getWastage())
                .timestamp(usage.getTimestamp())
                .build();
    }
}
