package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.reports.productionVsSales.ProductionVsSalesMonthlyResponseDTO;
import com.way2care.inventorymanagement.dto.reports.productionVsSales.ProductionVsSalesReportResponseDTO;
import com.way2care.inventorymanagement.service.ProductionVsSalesReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/production-vs-sales")
@RequiredArgsConstructor
public class ProductionVsSalesReportController {

    private final ProductionVsSalesReportService productionVsSalesReportService;

    @GetMapping
    public ProductionVsSalesReportResponseDTO getProductionVsSalesReport(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(required = false) Integer productId) {
        return productionVsSalesReportService.getProductionVsSalesReport(startDate, endDate, productId);
    }

    @GetMapping("/monthly")
    public ProductionVsSalesMonthlyResponseDTO getMonthlyProductionVsSalesReport(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(required = false) Integer productId) {
        return productionVsSalesReportService.getMonthlyProductionVsSalesReport(startDate, endDate, productId);
    }
}
