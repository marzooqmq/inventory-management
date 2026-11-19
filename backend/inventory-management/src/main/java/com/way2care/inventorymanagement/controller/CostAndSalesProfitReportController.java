package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.reports.costVsProfit.CostProfitMonthlyReportResponseDTO;
import com.way2care.inventorymanagement.dto.reports.salesProfit.SalesProfitMonthlyReportResponseDTO;
import com.way2care.inventorymanagement.service.CostAndSalesProfitReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/profit-reports")
@RequiredArgsConstructor
public class CostAndSalesProfitReportController {

    private final CostAndSalesProfitReportService costAndSalesProfitReportService;

    @GetMapping("/cost")
    public CostProfitMonthlyReportResponseDTO getCostProfitMonthlyReport(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(required = false) Integer productId) {
        return costAndSalesProfitReportService.getMonthlyCostProfitReport(startDate, endDate, productId);
    }

    @GetMapping("/sales")
    public SalesProfitMonthlyReportResponseDTO getSalesProfitMonthlyReport(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(required = false) Integer productId) {
        return costAndSalesProfitReportService.getMonthlySalesProfitReport(startDate, endDate, productId);
    }
}
