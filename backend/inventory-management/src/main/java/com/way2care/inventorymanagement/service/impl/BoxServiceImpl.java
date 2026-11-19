package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.BoxRequestDTO;
import com.way2care.inventorymanagement.dto.BoxResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.Box;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.repository.BoxRepository;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.service.BoxService;
import com.way2care.inventorymanagement.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoxServiceImpl implements BoxService {

    private final BoxRepository boxRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Override
    public List<BoxResponseDTO> getAll() {
        return boxRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public BoxResponseDTO getById(Integer id) {
        Box box = boxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Box not found"));
        return toResponse(box);
    }

    @Override
    public BoxResponseDTO create(BoxRequestDTO request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Box box = Box.builder()
                .product(product)
                .boxCostPerPad(request.getBoxCostPerPad())
                .active(request.getActive())
                .build();
        Box saved = boxRepository.save(box);
        productService.calculateProductCost(product.getId());
        return toResponse(saved);
    }

    @Override
    public BoxResponseDTO update(Integer id, BoxRequestDTO request) {
        Box existing = boxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Box not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        existing.setProduct(product);
        existing.setBoxCostPerPad(request.getBoxCostPerPad());
        existing.setActive(request.getActive());
        boxRepository.save(existing);
        productService.calculateProductCost(existing.getProduct().getId());
        return toResponse(existing);
    }

    @Override
    public void delete(Integer id) {
        Box box = boxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Box not found"));
        boxRepository.delete(box);
        productService.calculateProductCost(box.getProduct().getId());
    }

    private BoxResponseDTO toResponse(Box box) {
        return BoxResponseDTO.builder()
                .id(box.getId())
                .productId(box.getProduct().getId())
                .productName(box.getProduct().getName())
                .boxCostPerPad(box.getBoxCostPerPad())
                .active(box.getActive())
                .build();
    }
}
