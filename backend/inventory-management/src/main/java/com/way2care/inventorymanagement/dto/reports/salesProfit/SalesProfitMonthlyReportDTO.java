package com.way2care.inventorymanagement.dto.reports.salesProfit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesProfitMonthlyReportDTO {

    private Integer productId;
    private String productName;
    private String yearMonth;
    /**
     * Total quantity sold in boxes in the month
     */
    private Long soldQty;

    /**
     * Total revenue for the month
     */
    private BigDecimal revenue;

    /**
     * Cost price per box
     */
    private BigDecimal costPerBox;

    /**
     * Total cost = soldQty × costPrice
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
