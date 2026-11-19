package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.dto.reports.costVsProfit.CostProfitMonthlyReportProjection;
import com.way2care.inventorymanagement.dto.reports.salesProfit.SalesProfitMonthlyReportProjection;
import com.way2care.inventorymanagement.model.ReportDummy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CostAndSalesProfitReportRepository extends JpaRepository<ReportDummy, Integer> {

    @Query(value = """
            WITH production_monthly AS (
                SELECT p.product_id,
                       date_trunc('month', p."timestamp") AS month_start,
                       SUM(COALESCE(p.quantity_produced, 0))::bigint AS produced_qty
                FROM productions p
                WHERE p."timestamp" BETWEEN :startDate AND :endDate
                  AND (CAST(:productId AS integer) IS NULL OR p.product_id = :productId)
                GROUP BY p.product_id, date_trunc('month', p."timestamp")
            ),
            sales_monthly AS (
                SELECT ii.product_id,
                       date_trunc('month', i.invoice_date) AS month_start,
                       SUM(COALESCE(ii.quantity_in_boxes, 0))::bigint AS sold_qty,
                       SUM(COALESCE(ii.total, 0)) AS revenue
                FROM invoice_items ii
                JOIN invoices i ON i.id = ii.invoice_id
                WHERE i.invoice_date BETWEEN :startDate AND :endDate
                  AND i.status IS DISTINCT FROM 'CANCELLED'
                  AND (CAST(:productId AS integer) IS NULL OR ii.product_id = :productId)
                GROUP BY ii.product_id, date_trunc('month', i.invoice_date)
            ),
            report_periods AS (
                SELECT product_id, month_start FROM production_monthly
                UNION
                SELECT product_id, month_start FROM sales_monthly
            )
            SELECT product.id AS "productId",
                   product.name AS "productName",
                   to_char(periods.month_start, 'YYYY-MM') AS "yearMonth",
                   COALESCE(production.produced_qty, 0)::bigint AS "producedQty",
                   COALESCE(sales.sold_qty, 0)::bigint AS "soldQty",
                   COALESCE(sales.revenue, 0) AS "revenue",
                   COALESCE(history.cost_per_box, product.calculated_cost_price, product.cost_price, 0) AS "costPerBox",
                   COALESCE(history.cost_per_box, product.calculated_cost_price, product.cost_price, 0)
                       * COALESCE(production.produced_qty, 0) AS "totalCost",
                   COALESCE(sales.revenue, 0)
                       - (COALESCE(history.cost_per_box, product.calculated_cost_price, product.cost_price, 0)
                       * COALESCE(production.produced_qty, 0)) AS "profit",
                   CASE WHEN COALESCE(sales.revenue, 0) > 0
                       THEN (COALESCE(sales.revenue, 0)
                           - (COALESCE(history.cost_per_box, product.calculated_cost_price, product.cost_price, 0)
                           * COALESCE(production.produced_qty, 0))) * 100 / sales.revenue
                       ELSE 0
                   END AS "marginPercent"
            FROM report_periods periods
            JOIN products product ON product.id = periods.product_id
            LEFT JOIN production_monthly production
                ON production.product_id = periods.product_id
                AND production.month_start = periods.month_start
            LEFT JOIN sales_monthly sales
                ON sales.product_id = periods.product_id
                AND sales.month_start = periods.month_start
            LEFT JOIN LATERAL (
                SELECT history.cost_per_box
                FROM product_cost_history history
                WHERE history.product_id = product.id
                  AND history.valid_from < periods.month_start + INTERVAL '1 month'
                ORDER BY history.valid_from DESC, history.id DESC
                LIMIT 1
            ) history ON TRUE
            WHERE CAST(:productId AS integer) IS NULL OR product.id = :productId
            ORDER BY periods.month_start, product.name
            """, nativeQuery = true)
    List<CostProfitMonthlyReportProjection> getMonthlyCostProfitReport(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("productId") Integer productId);

    @Query(value = """
            WITH sales_monthly AS (
                SELECT ii.product_id,
                       date_trunc('month', i.invoice_date) AS month_start,
                       SUM(COALESCE(ii.quantity_in_boxes, 0))::bigint AS sold_qty,
                       SUM(COALESCE(ii.total, 0)) AS revenue
                FROM invoice_items ii
                JOIN invoices i ON i.id = ii.invoice_id
                WHERE i.invoice_date BETWEEN :startDate AND :endDate
                  AND i.status IS DISTINCT FROM 'CANCELLED'
                  AND (CAST(:productId AS integer) IS NULL OR ii.product_id = :productId)
                GROUP BY ii.product_id, date_trunc('month', i.invoice_date)
            )
            SELECT product.id AS "productId",
                   product.name AS "productName",
                   to_char(sales.month_start, 'YYYY-MM') AS "yearMonth",
                   sales.sold_qty AS "soldQty",
                   sales.revenue AS "revenue",
                   COALESCE(history.cost_per_box, product.calculated_cost_price, product.cost_price, 0)
                       * sales.sold_qty AS "totalCost",
                   sales.revenue
                       - (COALESCE(history.cost_per_box, product.calculated_cost_price, product.cost_price, 0)
                       * sales.sold_qty) AS "profit",
                   CASE WHEN sales.revenue > 0
                       THEN (sales.revenue
                           - (COALESCE(history.cost_per_box, product.calculated_cost_price, product.cost_price, 0)
                           * sales.sold_qty)) * 100 / sales.revenue
                       ELSE 0
                   END AS "marginPercent"
            FROM sales_monthly sales
            JOIN products product ON product.id = sales.product_id
            LEFT JOIN LATERAL (
                SELECT history.cost_per_box
                FROM product_cost_history history
                WHERE history.product_id = product.id
                  AND history.valid_from < sales.month_start + INTERVAL '1 month'
                ORDER BY history.valid_from DESC, history.id DESC
                LIMIT 1
            ) history ON TRUE
            WHERE CAST(:productId AS integer) IS NULL OR product.id = :productId
            ORDER BY sales.month_start, product.name
            """, nativeQuery = true)
    List<SalesProfitMonthlyReportProjection> getMonthlySalesProfitReport(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("productId") Integer productId);
}
