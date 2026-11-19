package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.reports.outstanding.OutstandingReportResponseDTO;

public interface OutstandingReportService {
    OutstandingReportResponseDTO getOutstandingReport(Integer customerId);
}
