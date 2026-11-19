package com.way2care.inventorymanagement.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class InvoicePaymentDTO {
    private BigDecimal paidAmount;
}
