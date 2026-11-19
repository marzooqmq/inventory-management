package com.way2care.inventorymanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RawMaterialRequestDTO {

    @NotBlank(message = "Name cannot be null")
    private String name;

    @NotNull(message = "Cost per unit cannot be null")
    @Min(value = 0, message = "Cost per unit must be non-negative")
    private BigDecimal costPerUnit;

    @NotNull(message = "Purchase unit cannot be null")
    private String purchaseUnit;

    @NotNull(message = "Consumption unit cannot be null")
    private String consumptionUnit;

    @NotNull(message = "Conversion factor cannot be null")
    @Min(value = 0, message = "Conversion factor must be non-negative")
    private BigDecimal conversionFactor;

    private Boolean active;
}
