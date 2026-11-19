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
public class SalesDashboardPaymentBreakdownDTO {
    private long paidCount;
    private long partiallyPaidCount;
    private long unpaidCount;
    private BigDecimal paidAmount;
    private BigDecimal partiallyPaidAmount;
    private BigDecimal unpaidAmount;
}
