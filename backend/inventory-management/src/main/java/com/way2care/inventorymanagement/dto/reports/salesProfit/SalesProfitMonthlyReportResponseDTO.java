package com.way2care.inventorymanagement.dto.reports.salesProfit;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SalesProfitMonthlyReportResponseDTO {
    private List<SalesProfitMonthlyReportDTO> records;
    private SalesProfitMonthlySummaryDTO summary;
}
