package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.dto.reports.sales.SalesReportProjection;
import com.way2care.inventorymanagement.dto.reports.sales.SalesReportSummaryProjection;
import com.way2care.inventorymanagement.model.Invoice;
import com.way2care.inventorymanagement.model.InvoiceItem;
import com.way2care.inventorymanagement.model.InvoiceStatus;
import com.way2care.inventorymanagement.model.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Integer> {

    List<InvoiceItem> findByInvoice(Invoice invoice);

    @Query("""
        select
            i.invoiceNumber as invoiceNumber,
            c.name as customerName,
            p.name as productName,
            ii.quantity as quantity,
            ii.unitType as unitType,
            ii.quantityInBoxes as quantityInBoxes,
            ii.rate as rate,
            ii.total as total,
            i.netAmount as invoiceNetAmount,
            i.paidAmount as invoicePaidAmount,
            i.paymentStatus as paymentStatus,
            i.invoiceDate as invoiceDate
        from InvoiceItem ii
        join ii.invoice i
        join i.customer c
        join ii.product p
        where i.invoiceDate between :start and :end
          and i.status = :status
          and (:invoiceNumber is null or i.invoiceNumber = :invoiceNumber)
          and (:customerId is null or c.id = :customerId)
          and (:productId is null or p.id = :productId)
          and (:paymentStatus is null or i.paymentStatus = :paymentStatus)
    """)
    Page<SalesReportProjection> findSalesReport(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("status") InvoiceStatus status,
            @Param("invoiceNumber") String invoiceNumber,
            @Param("customerId") Integer customerId,
            @Param("productId") Integer productId,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            Pageable pageable
    );

    @Query("""
        select
            count(distinct i.id) as totalInvoices,
            coalesce(sum(ii.quantityInBoxes), 0) as totalQuantity,
            coalesce(sum(ii.total), 0) as totalSales,
            coalesce(sum(distinct (i.totalAmount - i.netAmount)), 0) as totalDiscount,
            coalesce(sum(distinct i.netAmount), 0) as totalNetAmount,
            coalesce(sum(distinct i.paidAmount), 0) as totalPaidAmount
        from InvoiceItem ii 
        join ii.invoice i
        join i.customer c
        join ii.product p
        where i.invoiceDate between :start and :end
          and i.status = :status
          and (:invoiceNumber is null or i.invoiceNumber = :invoiceNumber)
          and (:customerId is null or c.id = :customerId)
          and (:productId is null or p.id = :productId)
          and (:paymentStatus is null or i.paymentStatus = :paymentStatus)
    """)
    SalesReportSummaryProjection findSalesSummary(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("status") InvoiceStatus status,
            @Param("invoiceNumber") String invoiceNumber,
            @Param("customerId") Integer customerId,
            @Param("productId") Integer productId,
            @Param("paymentStatus") PaymentStatus paymentStatus
    );

    /** Top N products by total revenue (all-time): [productId, productName, totalQuantity, totalRevenue] */
    @Query("""
        SELECT p.id, p.name, COALESCE(SUM(ii.quantity), 0), COALESCE(SUM(ii.total), 0)
        FROM InvoiceItem ii
        JOIN ii.invoice i
        JOIN ii.product p
        WHERE i.status != 'CANCELLED'
        GROUP BY p.id, p.name
        ORDER BY COALESCE(SUM(ii.total), 0) DESC
    """)
    List<Object[]> findTopProducts(Pageable pageable);
}
