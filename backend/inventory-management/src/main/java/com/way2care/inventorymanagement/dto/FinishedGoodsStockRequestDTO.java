package com.way2care.inventorymanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FinishedGoodsStockRequestDTO {

    @NotNull(message = "Product ID cannot be null")
    private Integer productId;
    @Min(value = 0, message = "Box Quantity must be non-negative")
    private Integer boxQuantity;
    @Min(value = 0, message = "Loose Pads must be non-negative")
    private Integer loosePads;
}
