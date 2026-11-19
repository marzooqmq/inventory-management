package com.way2care.inventorymanagement.dto.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesDashboardKpiDTO {
    private BigDecimal todayRevenue;
    private BigDecimal thisMonthRevenue;
    private BigDecimal lastMonthRevenue;
    private Double revenueGrowthPercent;   // % change vs last month
    private BigDecimal outstandingDues;    // Total unpaid / partially paid
    private long totalInvoicesThisMonth;
    private BigDecimal averageOrderValue;  // This month avg
    private long totalCustomers;
}
