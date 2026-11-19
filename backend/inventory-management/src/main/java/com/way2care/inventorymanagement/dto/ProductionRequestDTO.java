package com.way2care.inventorymanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductionRequestDTO {

    @NotNull(message = "Production Order ID cannot be null")
    private Integer productionOrderId;

    @NotNull(message = "Product ID cannot be null")
    private Integer productId;

    @NotNull(message = "Quantity Produced cannot be null")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantityProduced;
}
