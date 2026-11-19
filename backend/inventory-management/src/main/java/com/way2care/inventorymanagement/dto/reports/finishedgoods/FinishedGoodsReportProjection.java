package com.way2care.inventorymanagement.dto.reports.finishedgoods;

import java.time.LocalDateTime;

public interface FinishedGoodsReportProjection {
    Integer getProductId();
    String getProductName();
    Integer getBoxesProduced();
    Integer getLoosePadsProduced();
    LocalDateTime getProductionDate();
}
