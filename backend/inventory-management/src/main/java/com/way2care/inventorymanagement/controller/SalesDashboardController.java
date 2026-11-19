package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.sales.SalesDashboardDTO;
import com.way2care.inventorymanagement.service.SalesDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sales-dashboard")
@RequiredArgsConstructor
@Slf4j
public class SalesDashboardController {

    private final SalesDashboardService salesDashboardService;

    /**
     * Returns all sales dashboard data in a single API call for maximum performance.
     * Response is cached for 5 minutes on the server side.
     */
    @GetMapping
    public ResponseEntity<SalesDashboardDTO> getDashboard() {
        log.info("Fetching sales dashboard");
        return ResponseEntity.ok(salesDashboardService.getDashboard());
    }
}
