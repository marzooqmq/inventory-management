package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.reports.outstanding.OutstandingRecordDTO;
import com.way2care.inventorymanagement.dto.reports.outstanding.OutstandingRecordProjection;
import com.way2care.inventorymanagement.dto.reports.outstanding.OutstandingReportResponseDTO;
import com.way2care.inventorymanagement.repository.InvoiceRepository;
import com.way2care.inventorymanagement.service.OutstandingReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OutstandingReportServiceImpl implements OutstandingReportService {

    private final InvoiceRepository invoiceRepository;

    @Override
    @Transactional(readOnly = true)
    public OutstandingReportResponseDTO getOutstandingReport(Integer customerId) {

        List<OutstandingRecordProjection> projections =
                invoiceRepository.findOutstandingByCustomer(customerId);

        List<OutstandingRecordDTO> records = projections.stream()
                .map(p -> OutstandingRecordDTO.builder()
                        .customerId(p.getCustomerId())
                        .customerName(p.getCustomerName())
                        .totalInvoices(p.getTotalInvoices() != null ? p.getTotalInvoices() : 0L)
                        .totalAmount(nvl(p.getTotalAmount()))
                        .paidAmount(nvl(p.getPaidAmount()))
                        .balanceAmount(nvl(p.getBalanceAmount()))
                        .bucket0To30(nvl(p.getBucket0To30()))
                        .bucket31To60(nvl(p.getBucket31To60()))
                        .bucket61To90(nvl(p.getBucket61To90()))
                        .bucketAbove90(nvl(p.getBucketAbove90()))
                        .build())
                .toList();

        BigDecimal totalOutstanding  = sum(records, OutstandingRecordDTO::getBalanceAmount);
        BigDecimal totalBucket0To30  = sum(records, OutstandingRecordDTO::getBucket0To30);
        BigDecimal totalBucket31To60 = sum(records, OutstandingRecordDTO::getBucket31To60);
        BigDecimal totalBucket61To90 = sum(records, OutstandingRecordDTO::getBucket61To90);
        BigDecimal totalBucketAbove90 = sum(records, OutstandingRecordDTO::getBucketAbove90);

        return OutstandingReportResponseDTO.builder()
                .records(records)
                .totalCustomers(records.size())
                .totalOutstanding(totalOutstanding)
                .totalBucket0To30(totalBucket0To30)
                .totalBucket31To60(totalBucket31To60)
                .totalBucket61To90(totalBucket61To90)
                .totalBucketAbove90(totalBucketAbove90)
                .build();
    }

    private static BigDecimal nvl(BigDecimal val) {
        return val != null ? val : BigDecimal.ZERO;
    }

    private static BigDecimal sum(List<OutstandingRecordDTO> records,
                                   java.util.function.Function<OutstandingRecordDTO, BigDecimal> getter) {
        return records.stream()
                .map(getter)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
