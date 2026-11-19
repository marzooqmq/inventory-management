package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.dto.reports.productionOutput.ProductionOutputReportProjection;
import com.way2care.inventorymanagement.dto.reports.productionOutput.ProductionOutputSummaryProjection;
import com.way2care.inventorymanagement.dto.reports.productionVsSales.ProductionVsSalesReportProjection;
import com.way2care.inventorymanagement.model.StockItemType;
import com.way2care.inventorymanagement.model.StockTransaction;
import com.way2care.inventorymanagement.model.StockTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Integer> {

    @Query("""
        SELECT
            p.id AS productId,
            p.name AS productName,
            SUM(
                CASE
                    WHEN st.type = StockTransactionType.PRODUCTION_OUTPUT THEN st.quantity
                    WHEN st.type = StockTransactionType.PRODUCTION_ROLLBACK THEN -st.quantity
                    ELSE 0
                END
            ) AS totalBoxesProduced,
            DATE(st.timestamp) AS productionDate
        FROM StockTransaction st
        LEFT JOIN Product p ON p.id = st.itemId
        WHERE st.itemType = :itemType
          AND st.timestamp BETWEEN :start AND :end
          AND (:productId IS NULL OR p.id = :productId)
        GROUP BY p.id, DATE(st.timestamp)
        ORDER BY DATE(st.timestamp) DESC
    """)
    Page<ProductionOutputReportProjection> findProductionOutputReport(
            @Param("itemType") StockItemType itemType,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("productId") Integer productId,
            Pageable pageable);

    @Query("""
        SELECT
            COUNT(DISTINCT st.itemId) AS totalProducts,
            COALESCE(
                SUM(
                    CASE
                        WHEN st.type = StockTransactionType.PRODUCTION_OUTPUT THEN st.quantity
                        WHEN st.type = StockTransactionType.PRODUCTION_ROLLBACK THEN -st.quantity
                    ELSE 0
                END
                ), 0
            ) AS totalBoxesProduced
        FROM StockTransaction st
        WHERE st.itemType = :itemType
          AND st.timestamp BETWEEN :start AND :end
          AND (:productId IS NULL OR st.itemId = :productId)
    """)
    ProductionOutputSummaryProjection findProductionOutputSummary(
            @Param("itemType") StockItemType itemType,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("productId") Integer productId);
}
