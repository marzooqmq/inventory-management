package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BoxResponseDTO {
    private Integer id;
    private Integer productId;
    private String productName;
    private BigDecimal boxCostPerPad;
    private Boolean active;
}
