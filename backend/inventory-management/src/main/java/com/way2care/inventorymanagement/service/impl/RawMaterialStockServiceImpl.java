package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.RawMaterialStockRequestDTO;
import com.way2care.inventorymanagement.dto.RawMaterialStockResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.RawMaterial;
import com.way2care.inventorymanagement.model.RawMaterialStock;
import com.way2care.inventorymanagement.repository.RawMaterialRepository;
import com.way2care.inventorymanagement.repository.RawMaterialStockRepository;
import com.way2care.inventorymanagement.service.RawMaterialStockService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RawMaterialStockServiceImpl implements RawMaterialStockService {

    private final RawMaterialStockRepository rawMaterialStockRepository;
    private final RawMaterialRepository rawMaterialRepository;

    @Override
    public List<RawMaterialStockResponseDTO> getAll() {
        return rawMaterialStockRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public RawMaterialStockResponseDTO getById(Integer id) {
        return rawMaterialStockRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material Stock not found"));
    }

    @Override
    @Transactional
    public RawMaterialStockResponseDTO create(RawMaterialStockRequestDTO request) {
        if (rawMaterialStockRepository.existsByMaterialId(request.getMaterialId())) {
            throw new IllegalArgumentException("Stock entry for this Raw Material already exists");
        }

        RawMaterial material = rawMaterialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found"));

        RawMaterialStock stock = RawMaterialStock.builder()
                .material(material)
                .quantity(request.getQuantity())
                .minStockLevel(request.getMinStockLevel())
                .build();

        RawMaterialStock saved = rawMaterialStockRepository.save(stock);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public RawMaterialStockResponseDTO update(Integer id, RawMaterialStockRequestDTO request) {

        RawMaterialStock existing = rawMaterialStockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material Stock not found"));

        RawMaterial material = rawMaterialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found"));

        existing.setMaterial(material);
        existing.setQuantity(request.getQuantity());
        existing.setMinStockLevel(request.getMinStockLevel());
        existing.setLastUpdated(LocalDateTime.now());

        rawMaterialStockRepository.save(existing);
        return toResponse(existing);
    }

    @Override
    public void delete(Integer id) {
        RawMaterialStock rawMaterialStock = rawMaterialStockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material Stock not found"));
        rawMaterialStockRepository.delete(rawMaterialStock);
    }

    private RawMaterialStockResponseDTO toResponse(RawMaterialStock stock) {
        return RawMaterialStockResponseDTO.builder()
                .id(stock.getId())
                .materialId(stock.getMaterial().getId())
                .materialName(stock.getMaterial().getName())
                .quantity(stock.getQuantity())
                .minStockLevel(stock.getMinStockLevel())
                .lastUpdated(stock.getLastUpdated())
                .build();
    }
}
