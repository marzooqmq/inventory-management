package com.way2care.inventorymanagement.dto.reports.sales;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class SalesReportResponseDTO {
    private List<SalesReportDTO> records;

    private Long totalInvoices;
    private Long totalQuantityInBoxes;

    private BigDecimal grossAmount;   // sum of item totals
    private BigDecimal discountAmount; // sum of discountAmount
    private BigDecimal netAmount;     // sum of invoice netAmount
    private BigDecimal paidAmount;    // sum of paidAmount
    private BigDecimal balanceAmount; // net - paid


    private int page;
    private int size;
    private int totalPages;
    private long totalRecords;
}
