package com.way2care.inventorymanagement.dto.reports.productionVsSales;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductionVsSalesMonthlyDTO {
    private Integer productId;
    private String productName;
    private String yearMonth;

    private Long producedQty;
    private Long soldQty;
    private Long netQty;
    private Long cumulativeStock;
}
