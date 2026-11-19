package com.way2care.inventorymanagement.dto.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesDashboardRecentInvoiceDTO {
    private Integer id;
    private String invoiceNumber;
    private String customerName;
    private BigDecimal netAmount;
    private BigDecimal paidAmount;
    private String paymentStatus;
    private String invoiceStatus;
    private LocalDateTime invoiceDate;
}
