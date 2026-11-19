package com.way2care.inventorymanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RawMaterialStockRequestDTO {

    @NotNull(message = "Material ID cannot be null")
    private Integer materialId;

    @NotNull(message = "Quantity cannot be null")
    @Min(value = 0, message = "Quantity must be non-negative")
    private BigDecimal quantity;

    @Min(value = 0, message = "Minimum stock level must be non-negative")
    private BigDecimal minStockLevel;
}
