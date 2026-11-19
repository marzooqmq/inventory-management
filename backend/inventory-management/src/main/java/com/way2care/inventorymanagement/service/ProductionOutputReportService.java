package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.reports.productionOutput.ProductionOutputReportResponseDTO;

import java.time.LocalDate;

public interface ProductionOutputReportService {

    ProductionOutputReportResponseDTO getProductionOutputReport(
            LocalDate startDate, LocalDate endDate,
            Integer productId,
            int page, int size);
}
