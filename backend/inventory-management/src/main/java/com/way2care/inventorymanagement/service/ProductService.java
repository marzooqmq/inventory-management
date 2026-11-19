package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.ProductRequestDTO;
import com.way2care.inventorymanagement.dto.ProductResponseDTO;

import java.util.List;

public interface ProductService {
    List<ProductResponseDTO> getAll();
    ProductResponseDTO getById(Integer id);
    ProductResponseDTO create(ProductRequestDTO request);
    ProductResponseDTO update(Integer id, ProductRequestDTO request);
    void delete(Integer id);

    void calculateProductCost(Integer id);
}
