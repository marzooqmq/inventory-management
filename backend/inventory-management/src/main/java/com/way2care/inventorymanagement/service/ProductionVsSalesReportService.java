package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.reports.productionVsSales.ProductionVsSalesMonthlyResponseDTO;
import com.way2care.inventorymanagement.dto.reports.productionVsSales.ProductionVsSalesReportResponseDTO;

import java.time.LocalDate;

public interface ProductionVsSalesReportService {
    ProductionVsSalesReportResponseDTO getProductionVsSalesReport(
            LocalDate startDate, LocalDate endDate, Integer productId);

    ProductionVsSalesMonthlyResponseDTO getMonthlyProductionVsSalesReport(
            LocalDate startDate, LocalDate endDate, Integer productId);
}
