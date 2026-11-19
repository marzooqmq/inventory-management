package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.reports.costVsProfit.CostProfitMonthlyReportDTO;
import com.way2care.inventorymanagement.dto.reports.costVsProfit.CostProfitMonthlyReportProjection;
import com.way2care.inventorymanagement.dto.reports.costVsProfit.CostProfitMonthlyReportResponseDTO;
import com.way2care.inventorymanagement.dto.reports.costVsProfit.CostProfitMonthlySummaryDTO;
import com.way2care.inventorymanagement.dto.reports.salesProfit.SalesProfitMonthlyReportDTO;
import com.way2care.inventorymanagement.dto.reports.salesProfit.SalesProfitMonthlyReportProjection;
import com.way2care.inventorymanagement.dto.reports.salesProfit.SalesProfitMonthlyReportResponseDTO;
import com.way2care.inventorymanagement.dto.reports.salesProfit.SalesProfitMonthlySummaryDTO;
import com.way2care.inventorymanagement.repository.CostAndSalesProfitReportRepository;
import com.way2care.inventorymanagement.service.CostAndSalesProfitReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CostAndSalesProfitReportServiceImpl implements CostAndSalesProfitReportService {

    private final CostAndSalesProfitReportRepository costAndSalesProfitReportRepository;

    @Override
    public CostProfitMonthlyReportResponseDTO getMonthlyCostProfitReport(
            LocalDate startDate, LocalDate endDate, Integer productId) {

        List<CostProfitMonthlyReportProjection> records = costAndSalesProfitReportRepository.getMonthlyCostProfitReport(
                startDate.atStartOfDay(),
                endDate.atTime(LocalTime.MAX),
                productId);

        List<CostProfitMonthlyReportDTO> dtoList = records.stream()
                .map(r -> CostProfitMonthlyReportDTO.builder()
                        .productId(r.getProductId())
                        .productName(r.getProductName())
                        .yearMonth(r.getYearMonth())
                        .producedQty(r.getProducedQty())
                        .soldQty(r.getSoldQty())
                        .revenue(r.getRevenue())
                        .costPerBox(r.getCostPerBox())
                        .totalCost(r.getTotalCost())
                        .profit(r.getProfit())
                        .marginPercent(r.getMarginPercent())
                        .build())
                .toList();

        BigDecimal totalRevenue = records.stream()
                .map(r -> r.getRevenue() == null ? BigDecimal.ZERO : r.getRevenue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCost = records.stream()
                .map(r -> r.getTotalCost() == null ? BigDecimal.ZERO : r.getTotalCost())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalProfit = records.stream()
                .map(r -> r.getProfit() == null ? BigDecimal.ZERO : r.getProfit())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal overallProfitMargin = BigDecimal.ZERO;
        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            overallProfitMargin = totalProfit
                    .multiply(BigDecimal.valueOf(100))
                    .divide(totalRevenue, 2, RoundingMode.HALF_UP);
        }

        CostProfitMonthlySummaryDTO summary = CostProfitMonthlySummaryDTO.builder()
                .totalRevenue(totalRevenue)
                .totalCost(totalCost)
                .totalProfit(totalProfit)
                .overallMarginPercent(overallProfitMargin)
                .build();

        return CostProfitMonthlyReportResponseDTO.builder()
                .records(dtoList)
                .summary(summary)
                .build();
    }

    @Override
    public SalesProfitMonthlyReportResponseDTO getMonthlySalesProfitReport(
            LocalDate startDate, LocalDate endDate, Integer productId) {

        List<SalesProfitMonthlyReportProjection> records = costAndSalesProfitReportRepository.getMonthlySalesProfitReport(
                startDate.atStartOfDay(), endDate.atTime(LocalTime.MAX), productId);

        List<SalesProfitMonthlyReportDTO> dtoList = records.stream().map(r ->
                SalesProfitMonthlyReportDTO.builder()
                        .productId(r.getProductId())
                        .productName(r.getProductName())
                        .yearMonth(r.getYearMonth())
                        .soldQty(r.getSoldQty())
                        .revenue(r.getRevenue())
                        .costPerBox(r.getTotalCost() != null && r.getSoldQty() != null && r.getSoldQty() != 0 ?
                                r.getTotalCost().divide(BigDecimal.valueOf(r.getSoldQty()), 2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO)
                        .totalCost(r.getTotalCost())
                        .profit(r.getProfit())
                        .marginPercent(r.getMarginPercent())
                        .build()).toList();

        BigDecimal totalRevenue = records.stream()
                .map(r -> r.getRevenue() == null ? BigDecimal.ZERO : r.getRevenue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCost = records.stream()
                .map(r -> r.getTotalCost() == null ? BigDecimal.ZERO : r.getTotalCost())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalProfit = records.stream()
                .map(r -> r.getProfit() == null ? BigDecimal.ZERO : r.getProfit())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal overallMargin = BigDecimal.ZERO;
        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            overallMargin = totalProfit
                    .multiply(BigDecimal.valueOf(100))
                    .divide(totalRevenue, 2, RoundingMode.HALF_UP);
        }

        SalesProfitMonthlySummaryDTO summary = SalesProfitMonthlySummaryDTO.builder()
                .totalRevenue(totalRevenue)
                .totalCost(totalCost)
                .totalProfit(totalProfit)
                .overallMarginPercent(overallMargin)
                .build();

        return SalesProfitMonthlyReportResponseDTO.builder()
                .records(dtoList)
                .summary(summary)
                .build();
    }
}
