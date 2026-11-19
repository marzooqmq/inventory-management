package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.ProductConversionRequestDTO;
import com.way2care.inventorymanagement.dto.ProductConversionResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.ProductConversion;
import com.way2care.inventorymanagement.repository.ProductConversionRepository;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.service.ProductConversionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductConversionServiceImpl implements ProductConversionService {

    private final ProductConversionRepository productConversionRepository;
    private final ProductRepository productRepository;

    @Override
    public List<ProductConversionResponseDTO> getAll() {
        return productConversionRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public ProductConversionResponseDTO create(ProductConversionRequestDTO request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        ProductConversion conversion = ProductConversion.builder()
                .product(product)
                .unitName(request.getUnitName())
                .boxesPerUnit(request.getBoxesPerUnit())
                .build();
        ProductConversion saved = productConversionRepository.save(conversion);
        return toResponse(saved);
    }

    @Override
    public ProductConversionResponseDTO update(Integer id, ProductConversionRequestDTO request) {
        ProductConversion existing = productConversionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductConversion not found with id: " + id));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        existing.setProduct(product);
        existing.setUnitName(request.getUnitName());
        existing.setBoxesPerUnit(request.getBoxesPerUnit());
        productConversionRepository.save(existing);
        return toResponse(existing);
    }

    @Override
    public void delete(Integer id) {
        ProductConversion existing = productConversionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductConversion not found with id: " + id));
        productConversionRepository.delete(existing);
    }

    private ProductConversionResponseDTO toResponse(ProductConversion conversion) {
        return ProductConversionResponseDTO.builder()
                .id(conversion.getId())
                .productId(conversion.getProduct().getId())
                .productName(conversion.getProduct().getName())
                .unitName(conversion.getUnitName())
                .boxesPerUnit(conversion.getBoxesPerUnit())
                .build();
    }
}
