package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class DiscountResponseDTO {
    private BigDecimal discountAmount;
    private DiscountType discountType;
    private String offerName;
}
