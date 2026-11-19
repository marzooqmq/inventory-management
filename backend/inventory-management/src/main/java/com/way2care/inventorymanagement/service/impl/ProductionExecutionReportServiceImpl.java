package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.*;
import com.way2care.inventorymanagement.dto.reports.productionExecution.ProductionExecutionSummaryProjection;
import com.way2care.inventorymanagement.dto.reports.productionExecution.*;
import com.way2care.inventorymanagement.repository.ProductionRepository;
import com.way2care.inventorymanagement.repository.ProductionStageExecutionRepository;
import com.way2care.inventorymanagement.service.ProductionExecutionReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductionExecutionReportServiceImpl implements ProductionExecutionReportService {

    private final ProductionRepository productionRepository;
    private final ProductionStageExecutionRepository productionStageExecutionRepository;

    @Override
    public ProductionExecutionReportResponseDTO getProductionExecutionReport(
            LocalDate startDate, LocalDate endDate, Integer month, Integer year, int page, int size) {

        // ========= VALIDATION =========
        validateFilters(startDate, endDate, month, year);

        // ========= DATE RESOLUTION =========
        LocalDateTime start;
        LocalDateTime end;

        if (month != null && year != null) {
            YearMonth yearMonth = YearMonth.of(year, month);
            start = yearMonth.atDay(1).atStartOfDay();
            end = yearMonth.atEndOfMonth().atTime(LocalTime.MAX);
        } else {
            start = startDate.atStartOfDay();
            end = endDate.atTime(LocalTime.MAX);
        }

        Page<ProductionExecutionReportProjection> pageResult =
                productionRepository.findProductionExecutionReport(
                        start, end,
                        PageRequest.of(page, size, Sort.by("startDate").descending()));

        ProductionExecutionSummaryProjection summary =
                productionRepository.findProductionExecutionSummary(start, end);

        List<ProductionReportDTO> records = pageResult.stream().map(production ->
            ProductionReportDTO.builder()
                    .productionOrderId(production.getProductionOrderId())
                    .productName(production.getProductName())
                    .orderQty(production.getOrderQty())
                    .producedQty(production.getProducedQty())
                    .orderStatus(production.getOrderStatus())
                    .startDate(production.getStartDate())
                    .endDate(production.getEndDate())
                    .build()
        ).toList();

        return ProductionExecutionReportResponseDTO.builder()
                .records(records)
                .totalOrders(summary.getTotalOrders())
                .totalProducedQty(summary.getTotalProducedQty())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalPages(pageResult.getTotalPages())
                .totalRecords(pageResult.getTotalElements())
                .build();
    }

    @Override
    public StageProgressResponseDTO getStageProgressReport(LocalDate startDate, LocalDate endDate, int page, int size) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        Page<StageProgressProjection> pageResult =
                productionStageExecutionRepository.findStageProgressReport(start, end,
                        PageRequest.of(page, size, Sort.by("executedAt").descending()));

        // Grouping logic
        Map<Integer, StageProgressOrderDTO> groupedMap = new LinkedHashMap<>();

        for (StageProgressProjection row : pageResult.getContent()) {

            StageProgressOrderDTO orderDTO =
                    groupedMap.computeIfAbsent(
                            row.getProductionOrderId(),
                            id -> StageProgressOrderDTO.builder()
                                    .productionOrderId(id)
                                    .productName(row.getProductName())
                                    .stages(new ArrayList<>())
                                    .build());
            orderDTO.getStages().add(
                    StageProgressDTO.builder()
                            .stage(row.getStage())
                            .stageStatus(row.getStageStatus())
                            .inputQty(row.getInputQty())
                            .outputQty(row.getOutputQty())
                            .balanceQty(row.getBalanceQty())
                            .executedAt(row.getExecutedAt())
                            .build());
        }
        return StageProgressResponseDTO.builder()
                .records(new ArrayList<>(groupedMap.values()))
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalPages(pageResult.getTotalPages())
                .totalRecords(pageResult.getTotalElements())
                .build();
    }


    private void validateFilters(
            LocalDate startDate, LocalDate endDate, Integer month, Integer year) {
        boolean dateRangeProvided = startDate != null && endDate != null;
        boolean monthYearProvided = month != null && year != null;

        if (dateRangeProvided && monthYearProvided) {
            throw new IllegalArgumentException("Provide either date range or month and year, not both.");
        }
        if (!dateRangeProvided && !monthYearProvided) {
            throw new IllegalArgumentException("Either date range or month and year must be provided.");
        }
    }
}
