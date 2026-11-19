package com.way2care.inventorymanagement.dto.reports.productionOutput;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class ProductionOutputReportDTO {
    private Integer productId;
    private String productName;
    private BigDecimal boxesProduced;
    private LocalDate productionDate;
}
