package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.ProductConversionRequestDTO;
import com.way2care.inventorymanagement.dto.ProductConversionResponseDTO;

import java.util.List;

public interface ProductConversionService {
    List<ProductConversionResponseDTO> getAll();
    ProductConversionResponseDTO create(ProductConversionRequestDTO request);
    ProductConversionResponseDTO update(Integer id, ProductConversionRequestDTO request);
    void delete(Integer id);
}
