package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.reports.sales.SalesReportDTO;
import com.way2care.inventorymanagement.dto.reports.sales.SalesReportProjection;
import com.way2care.inventorymanagement.dto.reports.sales.SalesReportResponseDTO;
import com.way2care.inventorymanagement.dto.reports.sales.SalesReportSummaryProjection;
import com.way2care.inventorymanagement.model.InvoiceStatus;
import com.way2care.inventorymanagement.model.PaymentStatus;
import com.way2care.inventorymanagement.repository.InvoiceItemRepository;
import com.way2care.inventorymanagement.service.SalesReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesReportServiceImpl implements SalesReportService {

    private final InvoiceItemRepository invoiceItemRepository;

    @Override
    public SalesReportResponseDTO getSalesReport(
            LocalDate startDate, LocalDate endDate, Integer month, Integer year,
            String invoiceNumber, Integer customerId, Integer productId,
            PaymentStatus paymentStatus, int page, int size) {

        // ================= VALIDATION =================
        validateFilters(startDate, endDate, month, year, invoiceNumber, customerId, productId);

        // ================= DATE RESOLUTION =================
        LocalDateTime start;
        LocalDateTime end;

        if (month != null && year !=  null) {
            YearMonth yearMonth = YearMonth.of(year, month);
            start = yearMonth.atDay(1).atStartOfDay();
            end = yearMonth.atEndOfMonth().atTime(LocalTime.MAX);
        } else if (startDate != null && endDate!= null) {
            start = startDate.atStartOfDay();
            end = endDate.atTime(LocalTime.MAX);
        } else {
            throw new IllegalArgumentException("Invalid date filters provided.");
        }

        Page<SalesReportProjection> pageResult = invoiceItemRepository.findSalesReport(
                start, end, InvoiceStatus.CREATED,
                invoiceNumber, customerId, productId, paymentStatus,
                PageRequest.of(page, size, Sort.by("invoiceDate").descending())
        );

        SalesReportSummaryProjection summary = invoiceItemRepository.findSalesSummary(
                start, end, InvoiceStatus.CREATED,
                invoiceNumber, customerId, productId, paymentStatus
        );

        List<SalesReportDTO> records = pageResult.stream().map(item ->
                SalesReportDTO.builder()
                        .invoiceNumber(item.getInvoiceNumber())
                        .customerName(item.getCustomerName())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitType(item.getUnitType())
                        .quantityInBoxes(item.getQuantityInBoxes())
                        .rate(item.getRate())
                        .total(item.getTotal())
                        .netAmount(item.getInvoiceNetAmount())
                        .paidAmount(item.getInvoicePaidAmount())
                        .paymentStatus(item.getPaymentStatus())
                        .invoiceDate(item.getInvoiceDate())
                        .build()
        ).toList();

        BigDecimal balance =
                summary.gettotalNetAmount().subtract(summary.getTotalPaidAmount());

        return SalesReportResponseDTO.builder()
                .records(records)
                .totalInvoices(summary.getTotalInvoices())
                .totalQuantityInBoxes(summary.getTotalQuantity())
                .grossAmount(summary.getTotalSales())
                .discountAmount(summary.getTotalDiscount())
                .netAmount(summary.gettotalNetAmount())
                .paidAmount(summary.getTotalPaidAmount())
                .balanceAmount(balance)
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalPages(pageResult.getTotalPages())
                .totalRecords(pageResult.getTotalElements())
                .build();
    }

    // ================= VALIDATION LOGIC =================
    private void validateFilters(
            LocalDate startDate, LocalDate endDate,
            Integer month, Integer year,
            String invoiceNumber,
            Integer customerId,
            Integer productId
    ) {
        boolean isDateRangeProvided = startDate != null && endDate != null;
        boolean isMonthYearProvided = month != null && year != null;

        if (isDateRangeProvided && isMonthYearProvided) {
            throw new IllegalArgumentException("Provide either date range or month and year, not both.");
        }

        if (!isDateRangeProvided && !isMonthYearProvided) {
            throw new IllegalArgumentException("Either date range or month and year must be provided.");
        }
    }
}