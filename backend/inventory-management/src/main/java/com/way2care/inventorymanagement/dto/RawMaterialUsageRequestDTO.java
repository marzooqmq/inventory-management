package com.way2care.inventorymanagement.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RawMaterialUsageRequestDTO {
    private Integer productionOrderId;
    private Integer materialId;

    @Min(value = 0, message = "Quantity must be non-negative")
    private BigDecimal qtyUsed;

    @Min(value = 0, message = "Wastage must be non-negative")
    private BigDecimal wastage;
}
