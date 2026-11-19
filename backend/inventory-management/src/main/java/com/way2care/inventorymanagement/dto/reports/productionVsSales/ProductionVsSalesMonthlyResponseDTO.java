package com.way2care.inventorymanagement.dto.reports.productionVsSales;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProductionVsSalesMonthlyResponseDTO {
    private List<ProductionVsSalesMonthlyDTO> records;

    private List<ProductionVsSalesProductSummaryDTO> productSummary;

    private Long totalProduced;
    private Long totalSold;
    private Long stockAvailable;
}
