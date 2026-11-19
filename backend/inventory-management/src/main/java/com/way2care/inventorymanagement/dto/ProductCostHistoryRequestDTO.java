package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductCostHistoryRequestDTO {
    private Integer productId;
    private BigDecimal costPerBox;
    private LocalDateTime validFrom;
}

