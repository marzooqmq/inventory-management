package com.way2care.inventorymanagement.dto.reports.outstanding;

import java.math.BigDecimal;

public interface OutstandingRecordProjection {
    Integer getCustomerId();
    String getCustomerName();
    Long getTotalInvoices();
    BigDecimal getTotalAmount();
    BigDecimal getPaidAmount();
    BigDecimal getBalanceAmount();
    BigDecimal getBucket0To30();
    BigDecimal getBucket31To60();
    BigDecimal getBucket61To90();
    BigDecimal getBucketAbove90();
}
