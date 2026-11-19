package com.way2care.inventorymanagement.dto.reports.outstanding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OutstandingRecordDTO {
    private Integer customerId;
    private String customerName;
    private long totalInvoices;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private BigDecimal bucket0To30;
    private BigDecimal bucket31To60;
    private BigDecimal bucket61To90;
    private BigDecimal bucketAbove90;
}
