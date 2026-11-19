package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BOMResponseDTO {
    private Integer id;
    private Integer productId;
    private String productName;
    private Integer materialId;
    private String materialName;
    private BigDecimal qtyRequired;
}
