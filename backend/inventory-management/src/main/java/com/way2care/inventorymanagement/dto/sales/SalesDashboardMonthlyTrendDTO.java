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
public class SalesDashboardMonthlyTrendDTO {
    private int year;
    private int month;
    private String monthLabel;  // e.g. "Mar 2025"
    private BigDecimal revenue;
    private long invoiceCount;
}
