package com.way2care.inventorymanagement.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionStageCountDTO {
    private Long sealingCount;
    private Long finalCuttingCount;
    private Long foldingCount;
    private Long packingCount;
    private Long completedCount;
    private Long totalActive;
}
