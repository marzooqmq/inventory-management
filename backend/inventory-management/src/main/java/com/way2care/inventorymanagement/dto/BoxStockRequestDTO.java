package com.way2care.inventorymanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BoxStockRequestDTO {

    @NotNull(message = "Box ID cannot be null")
    private Integer boxId;

    @Min(value = 0, message = "Quantity must be non-negative")
    private Integer quantity;

    @Min(value = 0, message = "Minimum stock level must be non-negative")
    private Integer minStockLevel;
}
