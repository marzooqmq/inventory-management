package com.way2care.inventorymanagement.dto.reports.productionExecution;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StageProgressOrderDTO {
    private Integer productionOrderId;
    private String productName;
    private List<StageProgressDTO> stages;
}
