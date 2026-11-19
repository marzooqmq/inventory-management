package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.BoxStockRequestDTO;
import com.way2care.inventorymanagement.dto.BoxStockResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.Box;
import com.way2care.inventorymanagement.model.BoxStock;
import com.way2care.inventorymanagement.repository.BoxRepository;
import com.way2care.inventorymanagement.repository.BoxStockRepository;
import com.way2care.inventorymanagement.service.BoxStockService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoxStockServiceImpl implements BoxStockService {

    private final BoxStockRepository boxStockRepository;
    private final BoxRepository boxRepository;

    @Override
    public List<BoxStockResponseDTO> getAll() {
        return boxStockRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public BoxStockResponseDTO getById(Integer id) {
        BoxStock stock = boxStockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Box Stock not found"));
        return toResponse(stock);
    }

    @Override
    @Transactional
    public BoxStockResponseDTO create(BoxStockRequestDTO request) {
        Box box = boxRepository.findById(request.getBoxId())
                .orElseThrow(() -> new ResourceNotFoundException("Box not found"));

        BoxStock stock = BoxStock.builder()
                .box(box)
                .quantity(request.getQuantity())
                .minStockLevel(request.getMinStockLevel())
                .build();
        BoxStock saved = boxStockRepository.save(stock);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public BoxStockResponseDTO update(Integer id, BoxStockRequestDTO request) {
        BoxStock existing = boxStockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Box stock not found"));

        Box box = boxRepository.findById(request.getBoxId())
                .orElseThrow(() -> new ResourceNotFoundException("Box not found"));

        existing.setBox(box);
        existing.setQuantity(request.getQuantity());
        existing.setMinStockLevel(request.getMinStockLevel());
        existing.setLastUpdated(LocalDateTime.now());
        boxStockRepository.save(existing);
        return toResponse(existing);
    }

    @Override
    public void delete(Integer id) {
        BoxStock stock = boxStockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Box Stock not found"));
        boxStockRepository.delete(stock);
    }

    private BoxStockResponseDTO toResponse(BoxStock stock) {
        return BoxStockResponseDTO.builder()
                .id(stock.getId())
                .boxId(stock.getBox().getId())
                .productId(stock.getBox().getProduct().getId())
                .productName(stock.getBox().getProduct().getName())
                .quantity(stock.getQuantity())
                .minStockLevel(stock.getMinStockLevel())
                .lastUpdated(stock.getLastUpdated())
                .build();
    }
}
