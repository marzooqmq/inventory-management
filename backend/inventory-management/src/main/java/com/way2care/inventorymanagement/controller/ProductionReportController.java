package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.reports.productionExecution.ProductionExecutionReportResponseDTO;
import com.way2care.inventorymanagement.dto.reports.productionExecution.StageProgressResponseDTO;
import com.way2care.inventorymanagement.dto.reports.productionOutput.ProductionOutputReportResponseDTO;
import com.way2care.inventorymanagement.service.ProductionExecutionReportService;
import com.way2care.inventorymanagement.service.ProductionOutputReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/production-reports")
@RequiredArgsConstructor
public class ProductionReportController {

    private final ProductionExecutionReportService productionExecutionReportService;
    private final ProductionOutputReportService productionOutputReportService;

    @GetMapping("/execution")
    public ProductionExecutionReportResponseDTO getProductionExecutionReport(
            @RequestParam(required = false)LocalDate startDate,
            @RequestParam(required = false)LocalDate endDate,
            @RequestParam(required = false)Integer month,
            @RequestParam(required = false)Integer year,
            @RequestParam(defaultValue = "0")int page,
            @RequestParam(defaultValue = "10")int size) {
        return productionExecutionReportService.getProductionExecutionReport(
                startDate, endDate, month, year, page, size
        );
    }

    @GetMapping("/stage-progress")
    public StageProgressResponseDTO getStageProgressReport(
            @RequestParam(required = false)LocalDate startDate,
            @RequestParam(required = false)LocalDate endDate,
            @RequestParam(defaultValue = "0")int page,
            @RequestParam(defaultValue = "10")int size) {
        return productionExecutionReportService.getStageProgressReport(startDate, endDate, page, size);
    }

    @GetMapping("/output")
    public ProductionOutputReportResponseDTO getProductionOutputReport(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(required = false) Integer productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return productionOutputReportService.getProductionOutputReport(startDate, endDate, productId, page, size);
    }


}