package com.way2care.inventorymanagement.dto.reports.costVsProfit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostProfitMonthlyReportDTO {
    private Integer productId;

    private String productName;

    private String yearMonth;

    /**
     * Total quantity produced in the month
     */
    private Long producedQty;
    private Long soldQty;

    /**
     * Total revenue for the month
     */
    private BigDecimal revenue;

    /**
     * Cost price per unit (box) approved for the period
     */
    private BigDecimal costPerBox;

    /**
     * Total cost = costPrice × producedQty
     */
    private BigDecimal totalCost;

    /**
     * Profit = revenue − totalCost
     */
    private BigDecimal profit;

    /**
     * Margin % = (profit / revenue) × 100
     */
    private BigDecimal marginPercent;
}
