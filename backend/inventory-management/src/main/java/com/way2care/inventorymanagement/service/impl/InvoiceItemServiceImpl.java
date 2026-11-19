package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.InvoiceItemResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.InvoiceItem;
import com.way2care.inventorymanagement.repository.InvoiceItemRepository;
import com.way2care.inventorymanagement.repository.InvoiceRepository;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.service.InvoiceItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceItemServiceImpl implements InvoiceItemService {

    private final InvoiceItemRepository invoiceItemRepository;

    @Override
    public List<InvoiceItemResponseDTO> getAll() {
        return invoiceItemRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public InvoiceItemResponseDTO getById(Integer id) {
        InvoiceItem item = invoiceItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice Item not found"));
        return toResponse(item);
    }

    @Override
    public void delete(Integer id) {
        InvoiceItem item = invoiceItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice Item not found"));
        invoiceItemRepository.delete(item);
    }

    private InvoiceItemResponseDTO toResponse(InvoiceItem item) {
        return InvoiceItemResponseDTO.builder()
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .quantity(item.getQuantity())
                .unitType(item.getUnitType())
                .quantityInBoxes(item.getQuantityInBoxes())
                .rate(item.getRate())
                .total(item.getTotal())
                .build();
    }
}
