package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.RawMaterialRequestDTO;
import com.way2care.inventorymanagement.dto.RawMaterialResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.RawMaterial;
import com.way2care.inventorymanagement.repository.BillOfMaterialRepository;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.repository.RawMaterialRepository;
import com.way2care.inventorymanagement.service.ProductService;
import com.way2care.inventorymanagement.service.RawMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RawMaterialServiceImpl implements RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;
    private final BillOfMaterialRepository bomRepository;
    private final ProductService productService;

    @Override
    public List<RawMaterialResponseDTO> getAll() {
        return rawMaterialRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public RawMaterialResponseDTO getById(Integer id) {
        RawMaterial rawMaterial = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found"));
        return toResponse(rawMaterial);
    }

    @Override
    public RawMaterialResponseDTO create(RawMaterialRequestDTO request) {
        RawMaterial rawMaterial = RawMaterial.builder()
                .name(request.getName())
                .costPerUnit(request.getCostPerUnit())
                .purchaseUnit(request.getPurchaseUnit())
                .consumptionUnit(request.getConsumptionUnit())
                .conversionFactor(request.getConversionFactor())
                .active(request.getActive())
                .build();
        RawMaterial saved = rawMaterialRepository.save(rawMaterial);
        return toResponse(saved);
    }

    @Override
    public RawMaterialResponseDTO update(Integer id, RawMaterialRequestDTO request) {
        RawMaterial existing = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found"));

        boolean costChanged = existing.getCostPerUnit().compareTo(request.getCostPerUnit()) != 0 ||
                                existing.getConversionFactor().compareTo(request.getConversionFactor()) != 0;

        existing.setName(request.getName());
        existing.setPurchaseUnit(request.getPurchaseUnit());
        existing.setConsumptionUnit(request.getConsumptionUnit());
        existing.setConversionFactor(request.getConversionFactor());
        existing.setCostPerUnit(request.getCostPerUnit());
        existing.setActive(request.getActive());
        rawMaterialRepository.save(existing);

        // Recalculate costs for affected products
        if (costChanged) {
            List<Product> affectedProduct = bomRepository.findByMaterial(existing).stream()
                    .map(bom -> bom.getProduct()).distinct().toList();

            // Recalculate cost for each product
            affectedProduct.forEach(product -> productService.calculateProductCost(product.getId()));

        }
        return toResponse(existing);
    }

    @Override
    public void delete(Integer id) {
        RawMaterial rawMaterial = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found"));
        rawMaterialRepository.delete(rawMaterial);
    }

    private RawMaterialResponseDTO toResponse(RawMaterial rawMaterial) {
        return RawMaterialResponseDTO.builder()
                .id(rawMaterial.getId())
                .name(rawMaterial.getName())
                .purchaseUnit(rawMaterial.getPurchaseUnit())
                .consumptionUnit(rawMaterial.getConsumptionUnit())
                .conversionFactor(rawMaterial.getConversionFactor())
                .costPerUnit(rawMaterial.getCostPerUnit())
                .active(rawMaterial.getActive())
                .build();
    }
}
