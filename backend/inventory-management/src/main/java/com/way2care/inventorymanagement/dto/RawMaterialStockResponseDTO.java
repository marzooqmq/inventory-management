package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class RawMaterialStockResponseDTO {
    private Integer id;
    private Integer materialId;
    private String materialName;
    private BigDecimal quantity;
    private BigDecimal minStockLevel;
    private LocalDateTime lastUpdated;
}
