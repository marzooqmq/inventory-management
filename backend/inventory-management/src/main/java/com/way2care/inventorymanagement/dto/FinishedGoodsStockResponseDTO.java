package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FinishedGoodsStockResponseDTO {
    private Integer id;
    private Integer productId;
    private String productName;
    private Integer boxQuantity;
    private Integer loosePads;
    private LocalDateTime lastUpdated;
}
