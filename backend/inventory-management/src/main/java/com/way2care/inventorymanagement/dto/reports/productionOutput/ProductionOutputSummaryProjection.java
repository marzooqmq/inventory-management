package com.way2care.inventorymanagement.dto.reports.productionOutput;

import java.math.BigDecimal;

public interface ProductionOutputSummaryProjection {
    Long getTotalProducts();
    BigDecimal getTotalBoxesProduced();
}
