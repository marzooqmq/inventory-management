package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.ProductionOrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ProductionOrderResponseDTO {
    private Integer id;
    private String productName;
    private Integer quantity;
    private LocalDate startDate;
    private LocalDate endDate;
    private ProductionOrderStatus status;
}
