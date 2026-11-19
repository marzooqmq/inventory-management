package com.way2care.inventorymanagement.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for Reorder Point recommendations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReorderPointDTO {
    
    private String itemType; // RAW_MATERIAL or BOX
    private Integer itemId;
    private String itemName;
    private BigDecimal currentStock;
    private BigDecimal dailyConsumption;
    private Integer leadTimeDays; // Days to receive order
    private BigDecimal safetyStock; // Buffer stock
    private BigDecimal reorderPoint; // When to reorder
    private BigDecimal suggestedOrderQty; // Recommended order quantity
    private BigDecimal economicOrderQty; // EOQ for reference
    private Boolean shouldReorderNow; // Flag if stock <= reorder point
    private LocalDate stockoutDate; // Estimated date when stock hits zero
    private String unit; // kg or pcs
}
