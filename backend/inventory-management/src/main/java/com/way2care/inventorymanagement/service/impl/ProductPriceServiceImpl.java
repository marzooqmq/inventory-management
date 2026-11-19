package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.ProductPriceRequestDTO;
import com.way2care.inventorymanagement.dto.ProductPriceResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.ProductPrice;
import com.way2care.inventorymanagement.repository.ProductPriceRepository;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.service.ProductPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductPriceServiceImpl implements ProductPriceService {

    private final ProductPriceRepository productPriceRepository;
    private final ProductRepository productRepository;

    @Override
    public List<ProductPriceResponseDTO> getProductPrices() {
        return productPriceRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public ProductPriceResponseDTO create(ProductPriceRequestDTO request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        ProductPrice productPrice = ProductPrice.builder()
                .product(product)
                .customerType(request.getCustomerType())
                .pricePerBox(request.getPricePerBox())
                .build();
        ProductPrice saved = productPriceRepository.save(productPrice);
        return toResponse(saved);
    }

    @Override
    public ProductPriceResponseDTO update(Integer id, ProductPriceRequestDTO request) {
        ProductPrice existing = productPriceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductPrice not found with id: " + id));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));
        existing.setProduct(product);
        existing.setCustomerType(request.getCustomerType());
        existing.setPricePerBox(request.getPricePerBox());
        productPriceRepository.save(existing);
        return toResponse(existing);
    }

    @Override
    public void delete(Integer id) {
        ProductPrice productPrice = productPriceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductPrice not found with id: " + id));
        productPriceRepository.delete(productPrice);
    }

    private ProductPriceResponseDTO toResponse(ProductPrice productPrice) {
        return ProductPriceResponseDTO.builder()
                .id(productPrice.getId())
                .productId(productPrice.getProduct().getId())
                .productName(productPrice.getProduct().getName())
                .customerType(productPrice.getCustomerType())
                .pricePerBox(productPrice.getPricePerBox())
                .build();
    }
}
