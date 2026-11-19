package com.way2care.inventorymanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BOMRequestDTO {
    @NotNull(message = "Product ID cannot be null")
    private Integer productId;

    @NotNull(message = "Material ID cannot be null")
    private Integer materialId;

    @NotNull(message = "Quantity Required cannot be null")
    @Min(value = 0, message = "Quantity Required must be non-negative")
    private BigDecimal qtyRequired;
}
