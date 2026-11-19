package com.way2care.inventorymanagement.dto.reports.finishedgoods;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FinishedGoodsReportDTO {
    private Integer productId;
    private String productName;
    private Integer boxesProduced;
    private Integer loosePadsProduced;
    private LocalDateTime productionDate;
}
