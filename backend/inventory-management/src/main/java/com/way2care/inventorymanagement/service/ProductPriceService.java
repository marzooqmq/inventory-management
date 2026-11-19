package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.ProductPriceRequestDTO;
import com.way2care.inventorymanagement.dto.ProductPriceResponseDTO;

import java.util.List;

public interface ProductPriceService {
    List<ProductPriceResponseDTO> getProductPrices();
    ProductPriceResponseDTO create(ProductPriceRequestDTO request);
    ProductPriceResponseDTO update(Integer id, ProductPriceRequestDTO request);
    void delete(Integer id);

}
