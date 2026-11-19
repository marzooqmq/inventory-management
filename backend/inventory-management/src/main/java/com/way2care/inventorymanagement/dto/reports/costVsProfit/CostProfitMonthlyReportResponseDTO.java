package com.way2care.inventorymanagement.dto.reports.costVsProfit;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CostProfitMonthlyReportResponseDTO {
    private List<CostProfitMonthlyReportDTO> records;
    private CostProfitMonthlySummaryDTO summary;
}
