package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponseDTO {
    private Integer id;
    private String name;
    private String category;
    private String size;
    private String description;
    private Integer padsPerBox;
    private BigDecimal mrp;
    private BigDecimal costPrice;
    private BigDecimal calculatedCostPrice;
    private Boolean costDirty;
    private LocalDateTime costCalculatedAt;
    private Boolean active;
}
