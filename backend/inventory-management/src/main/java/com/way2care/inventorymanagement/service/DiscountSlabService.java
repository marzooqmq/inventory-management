package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.DiscountSlabRequestDTO;
import com.way2care.inventorymanagement.dto.DiscountSlabResponseDTO;
import com.way2care.inventorymanagement.model.DiscountSlab;

import java.util.List;

public interface DiscountSlabService {

    List<DiscountSlabResponseDTO> getAll();

    List<DiscountSlabResponseDTO> getActive();

    DiscountSlabResponseDTO create(DiscountSlabRequestDTO request);

    DiscountSlabResponseDTO update(Integer id, DiscountSlabRequestDTO request);

    void activate(Integer id);

    void deactivate(Integer id);
}
