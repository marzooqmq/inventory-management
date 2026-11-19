package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.InvoiceRequestDTO;
import com.way2care.inventorymanagement.dto.InvoiceResponseDTO;

import java.math.BigDecimal;
import java.util.List;

public interface InvoiceService {
    List<InvoiceResponseDTO> getAll();
    InvoiceResponseDTO getById(Integer id);
    InvoiceResponseDTO create(InvoiceRequestDTO request);
    void cancelInvoice(Integer id);
    void addPayment(Integer invoiceId, BigDecimal paidAmount);
}
