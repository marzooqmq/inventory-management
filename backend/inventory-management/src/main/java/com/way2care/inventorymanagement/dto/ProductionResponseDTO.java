package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProductionResponseDTO {
    private Integer id;
    private Integer productionOrderId;
    private String productName;
    private Integer quantityProduced;
    private LocalDateTime timestamp;
}
