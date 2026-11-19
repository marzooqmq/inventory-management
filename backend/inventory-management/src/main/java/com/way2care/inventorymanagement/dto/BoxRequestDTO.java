package com.way2care.inventorymanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BoxRequestDTO {

    @NotNull(message = "Product Id cannot be null")
    private Integer productId;

    @NotNull(message = "Box cost cannot be null")
    @Min(value = 0, message = "Box cost must be non-negative")
    private BigDecimal boxCostPerPad;

    private Boolean active;
}
