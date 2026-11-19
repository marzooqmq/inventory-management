package com.way2care.inventorymanagement.dto.reports.finishedgoods;

public interface FinishedGoodsReportSummaryProjection {
    Integer getTotalProducts();
    Integer getTotalBoxesProduced();
    Integer getTotalLoosePadsProduced();
}
