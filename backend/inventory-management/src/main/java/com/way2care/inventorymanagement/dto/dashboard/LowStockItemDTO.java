package com.way2care.inventorymanagement.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LowStockItemDTO {
    private String itemType; // RAW_MATERIAL, FINISHED_GOODS, BOX
    private Integer itemId;
    private String itemName;
    private BigDecimal currentQuantity;
    private BigDecimal minStockLevel;
    private BigDecimal stockDeficit;
    private String severity; // CRITICAL, WARNING, LOW
}
