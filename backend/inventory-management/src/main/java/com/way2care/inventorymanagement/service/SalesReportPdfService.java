package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.model.PaymentStatus;
import org.springframework.core.io.InputStreamResource;

import java.time.LocalDate;

public interface SalesReportPdfService {
    InputStreamResource generateSalesReportPdf(LocalDate startDate, LocalDate endDate, Integer month,
                                               Integer year, String invoiceNumber,
                                               Integer customerId, Integer productId,
                                               PaymentStatus paymentStatus);

    String buildPdfFileName(LocalDate startDate, LocalDate endDate, Integer month, Integer year, String invoiceNumber, Integer customerId, Integer productId);
}
