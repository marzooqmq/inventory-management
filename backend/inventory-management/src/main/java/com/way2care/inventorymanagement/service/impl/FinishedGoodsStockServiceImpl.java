package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.*;
import com.way2care.inventorymanagement.dto.reports.finishedgoods.FinishedGoodsReportDTO;
import com.way2care.inventorymanagement.dto.reports.finishedgoods.FinishedGoodsReportProjection;
import com.way2care.inventorymanagement.dto.reports.finishedgoods.FinishedGoodsReportResponseDTO;
import com.way2care.inventorymanagement.dto.reports.finishedgoods.FinishedGoodsReportSummaryProjection;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.FinishedGoodsStock;
import com.way2care.inventorymanagement.repository.FinishedGoodsStockRepository;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.service.FinishedGoodsStockService;
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
public class FinishedGoodsStockServiceImpl implements FinishedGoodsStockService {

    private final FinishedGoodsStockRepository finishedGoodsStockRepository;
    private final ProductRepository productRepository;

    @Override
    public List<FinishedGoodsStockResponseDTO> getAll() {
        return finishedGoodsStockRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public FinishedGoodsStockResponseDTO getById(Integer id) {
        FinishedGoodsStock stock = finishedGoodsStockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Finished Goods Stock not found"));
        return toResponse(stock);
    }

    @Override
    public FinishedGoodsReportResponseDTO getFinishedGoodsReport(
            LocalDate startDate, LocalDate endDate, Integer productId, int page, int size) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        Page<FinishedGoodsReportProjection> pageResult =
                finishedGoodsStockRepository.findFinishedGoodsReport(start, end, productId, PageRequest.of(page, size));

        FinishedGoodsReportSummaryProjection summary =
                finishedGoodsStockRepository.finindFinishedGoodsSummary(start, end, productId);

        List<FinishedGoodsReportDTO> records = pageResult.stream().map(record ->
                FinishedGoodsReportDTO.builder()
                        .productId(record.getProductId())
                        .productName(record.getProductName())
                        .boxesProduced(record.getBoxesProduced())
                        .loosePadsProduced(record.getLoosePadsProduced())
                        .productionDate(record.getProductionDate())
                        .build()).toList();

        return FinishedGoodsReportResponseDTO.builder()
                .records(records)
                .totalProducts(summary.getTotalProducts())
                .totalBoxesProduced(summary.getTotalBoxesProduced())
                .totalLoosePadsProduced(summary.getTotalLoosePadsProduced())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalPages(pageResult.getTotalPages())
                .totalRecords(pageResult.getTotalElements())
                .build();
    }

    private FinishedGoodsStockResponseDTO toResponse(FinishedGoodsStock stock) {
        return FinishedGoodsStockResponseDTO.builder()
                .id(stock.getId())
                .productId(stock.getProduct().getId())
                .productName(stock.getProduct().getName())
                .boxQuantity(stock.getBoxQuantity())
                .loosePads(stock.getLoosePads())
                .lastUpdated(stock.getLastUpdated())
                .build();
    }
}
