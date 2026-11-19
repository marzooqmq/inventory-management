package com.way2care.inventorymanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductionOrderRequestDTO {

    @NotNull(message = "Product ID cannot be null")
    private Integer productId;

    @NotNull(message = "Quantity cannot be null")
    @Min(value = 0, message = "Quantity must be non-negative")
    private Integer quantity;
}
