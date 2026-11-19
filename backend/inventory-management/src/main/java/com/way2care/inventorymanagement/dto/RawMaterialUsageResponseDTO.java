package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class RawMaterialUsageResponseDTO {
    private Integer id;
    private Integer productionOrderId;
    private String productionProductName;
    private Integer materialId;
    private String materialName;
    private BigDecimal qtyUsed;
    private BigDecimal wastage;
    private LocalDateTime timestamp;
}
