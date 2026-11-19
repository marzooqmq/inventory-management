package com.way2care.inventorymanagement.dto.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesDashboardDTO {

    // ── KPI Cards ─────────────────────────────────────────────────────────────
    private SalesDashboardKpiDTO kpiCards;

    // ── Revenue Trend (last 12 months) ────────────────────────────────────────
    private List<SalesDashboardMonthlyTrendDTO> revenueTrend;

    // ── Payment Status Breakdown (donut) ──────────────────────────────────────
    private SalesDashboardPaymentBreakdownDTO paymentBreakdown;

    // ── Top 10 Customers by Revenue (all-time) ────────────────────────────────
    private List<SalesDashboardTopCustomerDTO> topCustomers;

    // ── Top 10 Products by Revenue (all-time) ─────────────────────────────────
    private List<SalesDashboardTopProductDTO> topProducts;

    // ── Retail vs Wholesale Revenue (this month) ──────────────────────────────
    private SalesDashboardCustomerTypeDTO customerTypeRevenue;

    // ── Outstanding Dues Aging ────────────────────────────────────────────────
    private SalesDashboardDuesAgingDTO duesAging;

    // ── Recent Invoices (last 15) ─────────────────────────────────────────────
    private List<SalesDashboardRecentInvoiceDTO> recentInvoices;
}
