package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.reports.finishedgoods.FinishedGoodsReportResponseDTO;
import com.way2care.inventorymanagement.dto.FinishedGoodsStockResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface FinishedGoodsStockService {
    List<FinishedGoodsStockResponseDTO> getAll();
    FinishedGoodsStockResponseDTO getById(Integer id);

    FinishedGoodsReportResponseDTO getFinishedGoodsReport(
            LocalDate startDate, LocalDate endDate, Integer productId,
            int page, int size);
}
