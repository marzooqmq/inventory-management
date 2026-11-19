package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.reports.sales.SalesReportResponseDTO;
import com.way2care.inventorymanagement.model.PaymentStatus;

import java.time.LocalDate;

public interface SalesReportService {

    SalesReportResponseDTO getSalesReport(
            LocalDate startDate,
            LocalDate endDate,
            Integer month,
            Integer year,
            String invoiceNumber,
            Integer customerId,
            Integer productId,
            PaymentStatus paymentStatus,
            int page,
            int size
    );
}
