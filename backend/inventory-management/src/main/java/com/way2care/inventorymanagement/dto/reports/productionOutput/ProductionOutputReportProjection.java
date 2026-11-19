package com.way2care.inventorymanagement.dto.reports.productionOutput;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface ProductionOutputReportProjection {
    Integer getProductId();
    String getProductName();
    BigDecimal getTotalBoxesProduced();
    LocalDate getProductionDate();
}
