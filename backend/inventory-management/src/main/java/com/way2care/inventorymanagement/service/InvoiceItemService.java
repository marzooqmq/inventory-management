package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.InvoiceItemRequestDTO;
import com.way2care.inventorymanagement.dto.InvoiceItemResponseDTO;

import java.util.List;

public interface InvoiceItemService {
    List<InvoiceItemResponseDTO> getAll();
    InvoiceItemResponseDTO getById(Integer id);
    void delete(Integer id);
}
