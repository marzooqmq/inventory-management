package com.way2care.inventorymanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductionCostRequestDTO {
    @NotNull(message = "Product ID cannot be null")
    private Integer productId;

    @Min(value = 0, message = "Material Cost cannot be negative")
    private BigDecimal labourCost;
    @Min(value = 0, message = "Material Cost cannot be negative")
    private BigDecimal transportCost;
    @Min(value = 0, message = "Material Cost cannot be negative")
    private BigDecimal herbalCost;
    @Min(value = 0, message = "Material Cost cannot be negative")
    private BigDecimal machineCost;
    @Min(value = 0, message = "Material Cost cannot be negative")
    private BigDecimal overheadCost;
}
