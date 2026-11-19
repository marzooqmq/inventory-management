package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.ProductionOrderStatus;
import com.way2care.inventorymanagement.model.ProductionStage;
import com.way2care.inventorymanagement.model.ProductionStageStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductionReportDTO {

    private Integer productionOrderId;
    private String productName;
    private Integer orderQty;
    private Integer producedQty;
    private ProductionOrderStatus orderStatus;
    private LocalDate startDate;
    private LocalDate endDate;
}
