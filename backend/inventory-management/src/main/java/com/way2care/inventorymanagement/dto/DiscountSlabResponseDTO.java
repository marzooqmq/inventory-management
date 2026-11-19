package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.DiscountType;
import com.way2care.inventorymanagement.model.DiscountValueType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class DiscountSlabResponseDTO {
    private Integer id;

    private DiscountType discountType;

    private Integer minQuantity;
    private BigDecimal minAmount;

    private BigDecimal discountValue;
    private DiscountValueType discountValueType;

    private BigDecimal maxDiscountAmount;
    private BigDecimal maxDiscountPercentage;

    private String offerName;

    private LocalDate startDate;
    private LocalDate endDate;

    private Boolean active;
}
