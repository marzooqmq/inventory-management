package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.UnitType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InvoiceItemRequestDTO {

    @NotNull(message = "Product ID cannot be null")
    private Integer productId;

    @NotNull(message = "Quantity cannot be null")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Unit type cannot be null")
    private UnitType unitType;

}
