package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.dto.reports.outstanding.OutstandingRecordProjection;
import com.way2care.inventorymanagement.model.Invoice;
import com.way2care.inventorymanagement.model.InvoiceStatus;
import com.way2care.inventorymanagement.model.PaymentStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    long countByInvoiceNumberStartingWith(String prefix);
    long countByPaymentStatusIn(List<PaymentStatus> statuses);
    List<Invoice> findByInvoiceDateBetweenAndStatus(LocalDateTime start, LocalDateTime end, InvoiceStatus status);

    // ── Sales Dashboard Queries ────────────────────────────────────────────────

    /** Sum of netAmount for non-cancelled invoices in a date range */
    @Query("SELECT COALESCE(SUM(i.netAmount), 0) FROM Invoice i " +
           "WHERE i.invoiceDate BETWEEN :start AND :end AND i.status != 'CANCELLED'")
    BigDecimal sumNetAmountBetween(@Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);

    /** Count of non-cancelled invoices in a date range */
    @Query("SELECT COUNT(i) FROM Invoice i " +
           "WHERE i.invoiceDate BETWEEN :start AND :end AND i.status != 'CANCELLED'")
    long countBetween(@Param("start") LocalDateTime start,
                      @Param("end") LocalDateTime end);

    /** Total outstanding dues (netAmount - paidAmount) for unpaid/partial invoices */
    @Query("SELECT COALESCE(SUM(i.netAmount - i.paidAmount), 0) FROM Invoice i " +
           "WHERE i.paymentStatus IN :statuses AND i.status != 'CANCELLED'")
    BigDecimal sumOutstandingDues(@Param("statuses") List<PaymentStatus> statuses);

    /** Last N invoices ordered by date descending */
    @Query("SELECT i FROM Invoice i ORDER BY i.invoiceDate DESC")
    List<Invoice> findRecentInvoices(Pageable pageable);

    /** All unpaid / partially-paid invoices (for dues aging calculation) */
    @Query("SELECT i FROM Invoice i " +
           "WHERE i.paymentStatus IN :statuses AND i.status != 'CANCELLED'")
    List<Invoice> findUnpaidInvoices(@Param("statuses") List<PaymentStatus> statuses);

    /** Payment status breakdown: [paymentStatus, count, sumNetAmount] */
    @Query("SELECT i.paymentStatus, COUNT(i), COALESCE(SUM(i.netAmount), 0) " +
           "FROM Invoice i WHERE i.status != 'CANCELLED' GROUP BY i.paymentStatus")
    List<Object[]> findPaymentBreakdown();

    /** Top N customers by total revenue (all-time): [customerId, customerName, invoiceCount, totalRevenue] */
    @Query("SELECT c.id, c.name, COUNT(i.id), COALESCE(SUM(i.netAmount), 0) " +
           "FROM Invoice i JOIN i.customer c " +
           "WHERE i.status != 'CANCELLED' " +
           "GROUP BY c.id, c.name " +
           "ORDER BY COALESCE(SUM(i.netAmount), 0) DESC")
    List<Object[]> findTopCustomers(Pageable pageable);

    /** Outstanding / AR report – customer-wise unpaid dues with 30/60/90+ day aging buckets */
    @Query(value = """
        SELECT
            c.id                                        AS customerId,
            c.name                                      AS customerName,
            COUNT(i.id)                                 AS totalInvoices,
            COALESCE(SUM(i.net_amount), 0)              AS totalAmount,
            COALESCE(SUM(i.paid_amount), 0)             AS paidAmount,
            COALESCE(SUM(i.net_amount - i.paid_amount), 0)  AS balanceAmount,
            COALESCE(SUM(CASE WHEN CURRENT_DATE - i.invoice_date::date <= 30
                              THEN i.net_amount - i.paid_amount ELSE 0 END), 0)  AS bucket0To30,
            COALESCE(SUM(CASE WHEN CURRENT_DATE - i.invoice_date::date BETWEEN 31 AND 60
                              THEN i.net_amount - i.paid_amount ELSE 0 END), 0)  AS bucket31To60,
            COALESCE(SUM(CASE WHEN CURRENT_DATE - i.invoice_date::date BETWEEN 61 AND 90
                              THEN i.net_amount - i.paid_amount ELSE 0 END), 0)  AS bucket61To90,
            COALESCE(SUM(CASE WHEN CURRENT_DATE - i.invoice_date::date > 90
                              THEN i.net_amount - i.paid_amount ELSE 0 END), 0)  AS bucketAbove90
        FROM invoices i
        JOIN customers c ON i.customer_id = c.id
        WHERE i.payment_status IN ('UNPAID', 'PARTIALLY_PAID')
          AND i.status != 'CANCELLED'
          AND (:customerId IS NULL OR c.id = CAST(:customerId AS INTEGER))
        GROUP BY c.id, c.name
        ORDER BY COALESCE(SUM(i.net_amount - i.paid_amount), 0) DESC
    """, nativeQuery = true)
    List<OutstandingRecordProjection> findOutstandingByCustomer(@Param("customerId") Integer customerId);

    /** Revenue by customer type (Retail / Wholesale) in a date range: [type, count, totalRevenue] */
    @Query("SELECT c.type, COUNT(i.id), COALESCE(SUM(i.netAmount), 0) " +
           "FROM Invoice i JOIN i.customer c " +
           "WHERE i.status != 'CANCELLED' " +
           "AND i.invoiceDate BETWEEN :start AND :end " +
           "GROUP BY c.type")
    List<Object[]> findRevenueByCustomerType(@Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    /** Monthly revenue trend (last N months) – native PostgreSQL query */
    @Query(value = """
            SELECT
                EXTRACT(YEAR  FROM invoice_date)::int AS year,
                EXTRACT(MONTH FROM invoice_date)::int AS month,
                COALESCE(SUM(net_amount), 0)          AS revenue,
                COUNT(*)                               AS invoice_count
            FROM invoices
            WHERE invoice_date >= :start
              AND status != 'CANCELLED'
            GROUP BY year, month
            ORDER BY year, month
            """, nativeQuery = true)
    List<Object[]> findMonthlyRevenueTrend(@Param("start") LocalDateTime start);
}
