package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.DiscountResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface DiscountCalculationService {
    DiscountResponseDTO calculateDiscount(
            Integer totalBoxes,
            BigDecimal totalAmount,
            BigDecimal totalCostPrice,
            LocalDate invoiceDate
    );
}
