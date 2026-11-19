package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.reports.productionOutput.ProductionOutputReportDTO;
import com.way2care.inventorymanagement.dto.reports.productionOutput.ProductionOutputReportProjection;
import com.way2care.inventorymanagement.dto.reports.productionOutput.ProductionOutputReportResponseDTO;
import com.way2care.inventorymanagement.dto.reports.productionOutput.ProductionOutputSummaryProjection;
import com.way2care.inventorymanagement.model.StockItemType;
import com.way2care.inventorymanagement.model.StockTransactionType;
import com.way2care.inventorymanagement.repository.StockTransactionRepository;
import com.way2care.inventorymanagement.service.ProductionOutputReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionOutputReportServiceImpl implements ProductionOutputReportService {

    private final StockTransactionRepository stockTransactionRepository;

    @Override
    public ProductionOutputReportResponseDTO getProductionOutputReport(
            LocalDate startDate, LocalDate endDate, Integer productId, int page, int size) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        Page<ProductionOutputReportProjection> pageResult =
                stockTransactionRepository.findProductionOutputReport(
                        StockItemType.PRODUCT,
                        start, end, productId,
                        PageRequest.of(page, size));

        ProductionOutputSummaryProjection summary =
                stockTransactionRepository.findProductionOutputSummary(
                        StockItemType.PRODUCT,
                        start, end, productId);

        List<ProductionOutputReportDTO> records = pageResult.stream().map(record ->
                ProductionOutputReportDTO.builder()
                        .productId(record.getProductId())
                        .productName(record.getProductName())
                        .boxesProduced(record.getTotalBoxesProduced())
                        .productionDate(record.getProductionDate())
                        .build()).toList();

        return ProductionOutputReportResponseDTO.builder()
                .records(records)
                .totalProducts(summary.getTotalProducts())
                .totalBoxesProduced(summary.getTotalBoxesProduced())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalPages(pageResult.getTotalPages())
                .totalRecords(pageResult.getTotalElements())
                .build();
    }
}
