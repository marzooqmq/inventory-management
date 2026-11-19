package com.way2care.inventorymanagement.dto.reports.sales;

import java.math.BigDecimal;

public interface SalesReportSummaryProjection {
    Long getTotalInvoices();
    Long getTotalQuantity();
    BigDecimal getTotalSales();
    BigDecimal getTotalDiscount();
    BigDecimal gettotalNetAmount();
    BigDecimal getTotalPaidAmount();
}
