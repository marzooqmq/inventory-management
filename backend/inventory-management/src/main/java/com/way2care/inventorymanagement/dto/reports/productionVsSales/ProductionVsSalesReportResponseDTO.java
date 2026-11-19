package com.way2care.inventorymanagement.dto.reports.productionVsSales;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProductionVsSalesReportResponseDTO {
    private List<ProductionVsSalesReportProjection> records;

    private Long totalProducedQty;
    private Long totalSoldQty;
    private Long totalClosingStock;
}
