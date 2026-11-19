package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.sales.*;
import com.way2care.inventorymanagement.model.CustomerType;
import com.way2care.inventorymanagement.model.Invoice;
import com.way2care.inventorymanagement.model.PaymentStatus;
import com.way2care.inventorymanagement.repository.CustomerRepository;
import com.way2care.inventorymanagement.repository.InvoiceItemRepository;
import com.way2care.inventorymanagement.repository.InvoiceRepository;
import com.way2care.inventorymanagement.service.SalesDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalesDashboardServiceImpl implements SalesDashboardService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "salesDashboard", key = "'dashboard'")
    public SalesDashboardDTO getDashboard() {
        log.info("Building sales dashboard data");

        LocalDate today = LocalDate.now();

        // ── Date boundaries ──────────────────────────────────────────────────
        LocalDateTime startOfToday      = today.atStartOfDay();
        LocalDateTime endOfToday        = today.atTime(LocalTime.MAX);
        LocalDateTime startOfMonth      = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth        = today.withDayOfMonth(today.lengthOfMonth()).atTime(LocalTime.MAX);
        LocalDate     lastMonthDate     = today.minusMonths(1);
        LocalDateTime startOfLastMonth  = lastMonthDate.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfLastMonth    = lastMonthDate
                                            .withDayOfMonth(lastMonthDate.lengthOfMonth())
                                            .atTime(LocalTime.MAX);
        LocalDateTime last12MonthsStart = today.minusMonths(11).withDayOfMonth(1).atStartOfDay();

        // ── KPI Cards ────────────────────────────────────────────────────────
        BigDecimal todayRevenue     = nvl(invoiceRepository.sumNetAmountBetween(startOfToday, endOfToday));
        BigDecimal thisMonthRevenue = nvl(invoiceRepository.sumNetAmountBetween(startOfMonth, endOfMonth));
        BigDecimal lastMonthRevenue = nvl(invoiceRepository.sumNetAmountBetween(startOfLastMonth, endOfLastMonth));
        long thisMonthInvoices      = invoiceRepository.countBetween(startOfMonth, endOfMonth);
        BigDecimal outstandingDues  = nvl(invoiceRepository.sumOutstandingDues(
                List.of(PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID)));
        long totalCustomers         = customerRepository.count();

        BigDecimal avgOrderValue = thisMonthInvoices > 0
                ? thisMonthRevenue.divide(BigDecimal.valueOf(thisMonthInvoices), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Double revenueGrowthPercent = null;
        if (lastMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            revenueGrowthPercent = thisMonthRevenue
                    .subtract(lastMonthRevenue)
                    .divide(lastMonthRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        SalesDashboardKpiDTO kpi = SalesDashboardKpiDTO.builder()
                .todayRevenue(todayRevenue)
                .thisMonthRevenue(thisMonthRevenue)
                .lastMonthRevenue(lastMonthRevenue)
                .revenueGrowthPercent(revenueGrowthPercent)
                .outstandingDues(outstandingDues)
                .totalInvoicesThisMonth(thisMonthInvoices)
                .averageOrderValue(avgOrderValue)
                .totalCustomers(totalCustomers)
                .build();

        // ── Revenue Trend (last 12 months) ───────────────────────────────────
        List<Object[]> trendRaw = invoiceRepository.findMonthlyRevenueTrend(last12MonthsStart);

        // Build lookup map: "year-month" -> [revenue, count]
        Map<String, Object[]> trendMap = new HashMap<>();
        for (Object[] row : trendRaw) {
            String key = row[0] + "-" + row[1];
            trendMap.put(key, row);
        }

        List<SalesDashboardMonthlyTrendDTO> revenueTrend = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate m   = today.minusMonths(i);
            String    key = m.getYear() + "-" + m.getMonthValue();
            Object[]  row = trendMap.get(key);

            BigDecimal rev   = row != null ? toBigDecimal(row[2]) : BigDecimal.ZERO;
            long       count = row != null ? toLong(row[3])       : 0L;

            revenueTrend.add(SalesDashboardMonthlyTrendDTO.builder()
                    .year(m.getYear())
                    .month(m.getMonthValue())
                    .monthLabel(m.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                                + " " + m.getYear())
                    .revenue(rev)
                    .invoiceCount(count)
                    .build());
        }

        // ── Payment Breakdown ────────────────────────────────────────────────
        List<Object[]> paymentRaw = invoiceRepository.findPaymentBreakdown();
        SalesDashboardPaymentBreakdownDTO paymentBreakdown = buildPaymentBreakdown(paymentRaw);

        // ── Top 10 Customers ─────────────────────────────────────────────────
        List<Object[]> topCustRaw = invoiceRepository.findTopCustomers(PageRequest.of(0, 10));
        List<SalesDashboardTopCustomerDTO> topCustomers = topCustRaw.stream()
                .map(r -> SalesDashboardTopCustomerDTO.builder()
                        .customerId((Integer) r[0])
                        .customerName((String) r[1])
                        .invoiceCount(toLong(r[2]))
                        .totalRevenue(toBigDecimal(r[3]))
                        .build())
                .collect(Collectors.toList());

        // ── Top 10 Products ──────────────────────────────────────────────────
        List<Object[]> topProdRaw = invoiceItemRepository.findTopProducts(PageRequest.of(0, 10));
        List<SalesDashboardTopProductDTO> topProducts = topProdRaw.stream()
                .map(r -> SalesDashboardTopProductDTO.builder()
                        .productId((Integer) r[0])
                        .productName((String) r[1])
                        .totalQuantity(toLong(r[2]))
                        .totalRevenue(toBigDecimal(r[3]))
                        .build())
                .collect(Collectors.toList());

        // ── Customer Type Revenue (this month) ───────────────────────────────
        List<Object[]> ctRaw = invoiceRepository.findRevenueByCustomerType(startOfMonth, endOfMonth);
        SalesDashboardCustomerTypeDTO customerTypeRevenue = buildCustomerTypeRevenue(ctRaw);

        // ── Dues Aging ───────────────────────────────────────────────────────
        List<Invoice> unpaidInvoices = invoiceRepository.findUnpaidInvoices(
                List.of(PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID));
        SalesDashboardDuesAgingDTO duesAging = buildDuesAging(unpaidInvoices);

        // ── Recent Invoices (last 15) ─────────────────────────────────────────
        List<Invoice> recent = invoiceRepository.findRecentInvoices(PageRequest.of(0, 15));
        List<SalesDashboardRecentInvoiceDTO> recentInvoices = recent.stream()
                .map(inv -> SalesDashboardRecentInvoiceDTO.builder()
                        .id(inv.getId())
                        .invoiceNumber(inv.getInvoiceNumber())
                        .customerName(inv.getCustomer() != null ? inv.getCustomer().getName() : "—")
                        .netAmount(inv.getNetAmount())
                        .paidAmount(inv.getPaidAmount())
                        .paymentStatus(inv.getPaymentStatus() != null ? inv.getPaymentStatus().name() : null)
                        .invoiceStatus(inv.getStatus() != null ? inv.getStatus().name() : null)
                        .invoiceDate(inv.getInvoiceDate())
                        .build())
                .collect(Collectors.toList());

        return SalesDashboardDTO.builder()
                .kpiCards(kpi)
                .revenueTrend(revenueTrend)
                .paymentBreakdown(paymentBreakdown)
                .topCustomers(topCustomers)
                .topProducts(topProducts)
                .customerTypeRevenue(customerTypeRevenue)
                .duesAging(duesAging)
                .recentInvoices(recentInvoices)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private SalesDashboardPaymentBreakdownDTO buildPaymentBreakdown(List<Object[]> rows) {
        long paidCount = 0, partialCount = 0, unpaidCount = 0;
        BigDecimal paidAmt = BigDecimal.ZERO,
                   partialAmt = BigDecimal.ZERO,
                   unpaidAmt = BigDecimal.ZERO;

        for (Object[] row : rows) {
            String status = row[0].toString();
            long   count  = toLong(row[1]);
            BigDecimal amt = toBigDecimal(row[2]);

            switch (status) {
                case "PAID"           -> { paidCount    = count; paidAmt    = amt; }
                case "PARTIALLY_PAID" -> { partialCount = count; partialAmt = amt; }
                case "UNPAID"         -> { unpaidCount  = count; unpaidAmt  = amt; }
            }
        }

        return SalesDashboardPaymentBreakdownDTO.builder()
                .paidCount(paidCount)
                .partiallyPaidCount(partialCount)
                .unpaidCount(unpaidCount)
                .paidAmount(paidAmt)
                .partiallyPaidAmount(partialAmt)
                .unpaidAmount(unpaidAmt)
                .build();
    }

    private SalesDashboardCustomerTypeDTO buildCustomerTypeRevenue(List<Object[]> rows) {
        BigDecimal distributorRevenue = BigDecimal.ZERO,
                   dealerRevenue     = BigDecimal.ZERO,
                   directRevenue     = BigDecimal.ZERO;
        long distributorCount = 0, dealerCount = 0, directCount = 0;

        for (Object[] row : rows) {
            String type = row[0] != null ? row[0].toString() : "";
            long   cnt  = toLong(row[1]);
            BigDecimal rev = toBigDecimal(row[2]);

            if (CustomerType.DISTRIBUTOR.name().equalsIgnoreCase(type)) {
                distributorRevenue = rev; distributorCount = cnt;
            } else if (CustomerType.DEALER.name().equalsIgnoreCase(type)) {
                dealerRevenue = rev; dealerCount = cnt;
            } else if (CustomerType.DIRECT_CUSTOMER.name().equalsIgnoreCase(type)) {
                directRevenue = rev; directCount = cnt;
            }
        }

        return SalesDashboardCustomerTypeDTO.builder()
                .distributorRevenue(distributorRevenue)
                .dealerRevenue(dealerRevenue)
                .directCustomerRevenue(directRevenue)
                .distributorCount(distributorCount)
                .dealerCount(dealerCount)
                .directCustomerCount(directCount)
                .build();
    }

    private SalesDashboardDuesAgingDTO buildDuesAging(List<Invoice> invoices) {
        BigDecimal a0 = BigDecimal.ZERO, a31 = BigDecimal.ZERO,
                   a61 = BigDecimal.ZERO, a90 = BigDecimal.ZERO;
        long c0 = 0, c31 = 0, c61 = 0, c90 = 0;

        LocalDateTime now = LocalDateTime.now();

        for (Invoice inv : invoices) {
            BigDecimal balance = nvl(inv.getNetAmount()).subtract(nvl(inv.getPaidAmount()));
            if (balance.compareTo(BigDecimal.ZERO) <= 0) continue;

            long daysOld = ChronoUnit.DAYS.between(inv.getInvoiceDate(), now);

            if      (daysOld <= 30)  { a0  = a0.add(balance);  c0++; }
            else if (daysOld <= 60)  { a31 = a31.add(balance); c31++; }
            else if (daysOld <= 90)  { a61 = a61.add(balance); c61++; }
            else                     { a90 = a90.add(balance); c90++; }
        }

        return SalesDashboardDuesAgingDTO.builder()
                .days0to30(a0).count0to30(c0)
                .days31to60(a31).count31to60(c31)
                .days61to90(a61).count61to90(c61)
                .days90plus(a90).count90plus(c90)
                .build();
    }

    private BigDecimal nvl(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    private BigDecimal toBigDecimal(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof BigDecimal bd) return bd;
        if (o instanceof Number n) return new BigDecimal(n.toString());
        return BigDecimal.ZERO;
    }

    private long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Number n) return n.longValue();
        return 0L;
    }
}
