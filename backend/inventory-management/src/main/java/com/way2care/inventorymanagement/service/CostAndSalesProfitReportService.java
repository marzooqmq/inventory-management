package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.reports.costVsProfit.CostProfitMonthlyReportResponseDTO;
import com.way2care.inventorymanagement.dto.reports.salesProfit.SalesProfitMonthlyReportResponseDTO;

import java.time.LocalDate;

public interface CostAndSalesProfitReportService {
    CostProfitMonthlyReportResponseDTO getMonthlyCostProfitReport(
            LocalDate startDate, LocalDate endDate, Integer productId);

    SalesProfitMonthlyReportResponseDTO getMonthlySalesProfitReport(
            LocalDate startDate, LocalDate endDate, Integer productId);
}
