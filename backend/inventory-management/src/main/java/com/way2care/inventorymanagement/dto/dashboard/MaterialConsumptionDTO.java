package com.way2care.inventorymanagement.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for Material Consumption tracking
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialConsumptionDTO {
    
    private Integer materialId;
    private String materialName;
    private BigDecimal dailyConsumption; // kg per day
    private BigDecimal weeklyConsumption; // kg per week
    private BigDecimal currentStock; // Current stock in kg
    private Integer daysOfSupply; // How many days stock will last
    private String unit; // kg
    private ConsumptionStatus status; // HEALTHY, WARNING, CRITICAL
    
    public enum ConsumptionStatus {
        HEALTHY,   // More than 15 days of supply
        WARNING,   // 7-15 days of supply
        CRITICAL   // Less than 7 days of supply
    }
}
