package com.way2care.inventorymanagement.dto.reports.sales;

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
public class SalesReportDTO {
    private String invoiceNumber;
    private String customerName;
    private String productName;
    private Integer quantity;
    private String unitType;
    private Integer quantityInBoxes;
    private BigDecimal rate;
    private BigDecimal total;
    private BigDecimal netAmount;
    private BigDecimal paidAmount;
    private String paymentStatus;
    private LocalDateTime invoiceDate;
}
