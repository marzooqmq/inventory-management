package com.way2care.inventorymanagement.dto.reports.productionVsSales;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductionVsSalesProductSummaryDTO {
    private Integer productId;
    private String productName;

    private Long totalProduced;
    private Long totalSold;
    private Long stockAvailable;
}
