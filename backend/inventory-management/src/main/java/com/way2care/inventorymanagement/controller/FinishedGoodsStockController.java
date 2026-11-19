package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.reports.finishedgoods.FinishedGoodsReportResponseDTO;
import com.way2care.inventorymanagement.dto.FinishedGoodsStockResponseDTO;
import com.way2care.inventorymanagement.service.FinishedGoodsStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/finished-stock")
@RequiredArgsConstructor
@Validated
public class FinishedGoodsStockController {
    private final FinishedGoodsStockService finishedGoodsStockService;

    @GetMapping
    public List<FinishedGoodsStockResponseDTO> getAll() {
        return finishedGoodsStockService.getAll();
    }

    @GetMapping("/{id}")
    public FinishedGoodsStockResponseDTO getById(@PathVariable Integer id) {
        return finishedGoodsStockService.getById(id);
    }

    @GetMapping("/report")
    public FinishedGoodsReportResponseDTO getFinishedGoodsReport(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false)LocalDate endDate,
            @RequestParam(required = false)Integer productId,
            @RequestParam(defaultValue = "0")int page,
            @RequestParam(defaultValue = "10")int size) {
        return finishedGoodsStockService.getFinishedGoodsReport(startDate, endDate, productId, page, size);
    }

}
