package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.reports.sales.SalesReportResponseDTO;
import com.way2care.inventorymanagement.model.PaymentStatus;
import com.way2care.inventorymanagement.service.SalesReportPdfService;
import com.way2care.inventorymanagement.service.SalesReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/sales-reports")
@RequiredArgsConstructor
public class SalesReportController {

    private final SalesReportService salesReportService;
    private final SalesReportPdfService salesReportPdfService;

    @GetMapping
    public SalesReportResponseDTO getSalesReport(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String invoiceNumber,
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return salesReportService.getSalesReport(
                startDate, endDate, month, year,
                invoiceNumber, customerId, productId,
                paymentStatus, page, size);
    }

    @GetMapping("/pdf")
    public ResponseEntity<InputStreamResource> salesReportPdf(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String invoiceNumber,
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" +
                        salesReportPdfService.buildPdfFileName(startDate, endDate, month, year,
                                invoiceNumber, customerId, productId))
                .contentType(MediaType.APPLICATION_PDF)
                .body(salesReportPdfService.generateSalesReportPdf(
                        startDate, endDate, month, year,
                        invoiceNumber, customerId, productId, paymentStatus));
    }
}
