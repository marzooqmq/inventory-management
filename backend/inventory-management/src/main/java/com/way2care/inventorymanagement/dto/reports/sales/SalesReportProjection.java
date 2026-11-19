package com.way2care.inventorymanagement.dto.reports.sales;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface SalesReportProjection {
    String getInvoiceNumber();
    String getCustomerName();
    String getProductName();
    Integer getQuantity();
    String getUnitType();
    Integer getQuantityInBoxes();
    BigDecimal getRate();
    BigDecimal getTotal();
    BigDecimal getInvoiceNetAmount();
    BigDecimal getInvoicePaidAmount();
    String getPaymentStatus();
    LocalDateTime getInvoiceDate();
}
