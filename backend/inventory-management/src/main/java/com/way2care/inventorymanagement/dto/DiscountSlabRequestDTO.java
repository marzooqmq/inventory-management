package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.DiscountType;
import com.way2care.inventorymanagement.model.DiscountValueType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DiscountSlabRequestDTO {

    @NotNull
    private DiscountType discountType;

    private Integer minQuantity;
    private BigDecimal minAmount;

    @NotNull
    private BigDecimal discountValue;
    @NotNull
    private DiscountValueType discountValueType;

    private BigDecimal maxDiscountAmount;
    private BigDecimal maxDiscountPercentage;

    private String offerName;

    private LocalDate startDate;
    private LocalDate endDate;

    @NotNull
    private Boolean active;
}
