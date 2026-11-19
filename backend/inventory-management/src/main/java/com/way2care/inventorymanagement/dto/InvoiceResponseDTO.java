package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.InvoiceStatus;
import com.way2care.inventorymanagement.model.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class InvoiceResponseDTO {
    private Integer id;
    private String invoiceNumber;

    private Integer customerId;
    private String customerName;
    private String phoneNumber;

    private BigDecimal totalAmount;
    private BigDecimal discount;
    private BigDecimal netAmount;

    private InvoiceStatus status;
    private PaymentStatus paymentStatus;
    private BigDecimal paidAmount;
    private LocalDateTime invoiceDate;

    private List<InvoiceItemResponseDTO> items;
}
