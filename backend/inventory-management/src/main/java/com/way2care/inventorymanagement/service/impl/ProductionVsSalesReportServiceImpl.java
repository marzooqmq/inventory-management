package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.reports.productionVsSales.*;
import com.way2care.inventorymanagement.repository.ProductionvsSalesRepository;
import com.way2care.inventorymanagement.service.ProductionVsSalesReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductionVsSalesReportServiceImpl implements ProductionVsSalesReportService {

    private final ProductionvsSalesRepository productionvsSalesRepository;

    @Override
    public ProductionVsSalesReportResponseDTO getProductionVsSalesReport(
            LocalDate startDate, LocalDate endDate, Integer productId) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<ProductionVsSalesReportProjection> records =
                productionvsSalesRepository.getProductionVsSalesReport(start, end, productId);

        long totalProduced = records.stream()
                .mapToLong(r -> r.getProducedQty() != null ? r.getProducedQty() : 0)
                .sum();

        long totalSold = records.stream()
                .mapToLong(r -> r.getSoldQty() != null ? r.getSoldQty() : 0)
                .sum();

        long totalClosing = records.stream()
                .mapToLong(r -> r.getClosingStock() != null ? r.getClosingStock() : 0)
                .sum();

        return ProductionVsSalesReportResponseDTO.builder()
                .records(records)
                .totalProducedQty(totalProduced)
                .totalSoldQty(totalSold)
                .totalClosingStock(totalClosing)
                .build();
    }

    @Override
    public ProductionVsSalesMonthlyResponseDTO getMonthlyProductionVsSalesReport(
            LocalDate startDate, LocalDate endDate, Integer productId) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<ProductionVsSalesMonthlyProjection> projections =
                productionvsSalesRepository.getMonthlyProductionVsSalesReport(start, end, productId);

        List<ProductionVsSalesMonthlyDTO> records = new ArrayList<>();
        for (ProductionVsSalesMonthlyProjection projection : projections) {
            records.add(ProductionVsSalesMonthlyDTO.builder()
                    .productId(projection.getProductId())
                    .productName(projection.getProductName())
                    .yearMonth(projection.getYearMonth())
                    .producedQty(projection.getProducedQty())
                    .soldQty(projection.getSoldQty())
                    .netQty(projection.getNetQty())
                    .cumulativeStock(projection.getCumulativeStock())
                    .build());
        }

        // Product wise summary
        Map<Integer, ProductionVsSalesProductSummaryDTO> productSummary = new LinkedHashMap<>();

        for (ProductionVsSalesMonthlyProjection projection : projections) {
            productSummary.computeIfAbsent(projection.getProductId(),
                    id -> ProductionVsSalesProductSummaryDTO.builder()
                            .productId(projection.getProductId())
                            .productName(projection.getProductName())
                            .totalProduced(0L)
                            .totalSold(0L)
                            .stockAvailable(0L)
                            .build());

            ProductionVsSalesProductSummaryDTO summary = productSummary.get(projection.getProductId());
            summary.setTotalProduced(summary.getTotalProduced() + projection.getProducedQty());
            summary.setTotalSold(summary.getTotalSold() + projection.getSoldQty());
            summary.setStockAvailable(summary.getStockAvailable() + projection.getNetQty());
        }

        // Overall Summary
        long totalProduced = productSummary.values().stream()
                .mapToLong(ProductionVsSalesProductSummaryDTO::getTotalProduced).sum();
        long totalSold = productSummary.values().stream()
                .mapToLong(ProductionVsSalesProductSummaryDTO::getTotalSold).sum();
        long stockAvailable = productSummary.values().stream()
                .mapToLong(ProductionVsSalesProductSummaryDTO::getStockAvailable).sum();

        return ProductionVsSalesMonthlyResponseDTO.builder()
                .records(records)
                .productSummary(new ArrayList<>(productSummary.values()))
                .totalProduced(totalProduced)
                .totalSold(totalSold)
                .stockAvailable(stockAvailable)
                .build();
    }
}
