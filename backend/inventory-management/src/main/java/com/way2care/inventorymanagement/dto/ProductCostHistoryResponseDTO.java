package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductCostHistoryResponseDTO {
    private Integer id;
    private Integer productId;
    private String productName;
    private BigDecimal costPerBox;
    private LocalDateTime validFrom;
    private LocalDateTime createdAt;
}
