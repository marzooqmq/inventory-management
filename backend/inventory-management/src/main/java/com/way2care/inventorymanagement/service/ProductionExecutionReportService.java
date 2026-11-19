package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.reports.productionExecution.ProductionExecutionReportResponseDTO;
import com.way2care.inventorymanagement.dto.reports.productionExecution.StageProgressResponseDTO;

import java.time.LocalDate;

public interface ProductionExecutionReportService {
    ProductionExecutionReportResponseDTO getProductionExecutionReport(
            LocalDate startDate, LocalDate endDate,
            Integer month, Integer year,
            int page, int size);

    StageProgressResponseDTO getStageProgressReport(
            LocalDate startDate, LocalDate endDate, int page, int size);
}
