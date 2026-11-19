package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductionCostResponseDTO {
    private Integer id;
    private Integer productId;

    private BigDecimal labourCost;
    private BigDecimal transportCost;
    private BigDecimal herbalCost;
    private BigDecimal machineCost;
    private BigDecimal overheadCost; // EB/Packing
    private BigDecimal totalCost;
}
