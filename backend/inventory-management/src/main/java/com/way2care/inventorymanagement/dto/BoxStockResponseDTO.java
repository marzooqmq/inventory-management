package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BoxStockResponseDTO {
    private Integer id;
    private Integer boxId;
    private Integer productId;
    private String productName;
    private Integer quantity;
    private Integer minStockLevel;
    private LocalDateTime lastUpdated;
}
