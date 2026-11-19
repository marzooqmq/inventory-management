package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.reports.outstanding.OutstandingReportResponseDTO;
import com.way2care.inventorymanagement.service.OutstandingReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports/outstanding")
@RequiredArgsConstructor
public class OutstandingReportController {

    private final OutstandingReportService outstandingReportService;

    @GetMapping
    public OutstandingReportResponseDTO getOutstandingReport(
            @RequestParam(required = false) Integer customerId) {
        return outstandingReportService.getOutstandingReport(customerId);
    }
}
