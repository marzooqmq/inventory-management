package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.dto.reports.finishedgoods.FinishedGoodsReportProjection;
import com.way2care.inventorymanagement.dto.reports.finishedgoods.FinishedGoodsReportSummaryProjection;
import com.way2care.inventorymanagement.model.FinishedGoodsStock;
import com.way2care.inventorymanagement.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface FinishedGoodsStockRepository extends JpaRepository<FinishedGoodsStock, Integer> {
    Optional<FinishedGoodsStock> findByProduct(Product product);

    @Query("""
        SELECT 
            f.product.id AS productId,
            f.product.name AS productName,
            SUM(f.boxQuantity) AS boxesProduced,
            SUM(f.loosePads) AS loosePadsProduced,
            f.lastUpdated AS productionDate
        FROM FinishedGoodsStock f
        WHERE (:productId IS NULL OR f.product.id = :productId)
          AND f.lastUpdated BETWEEN :start AND :end
        GROUP BY f.product.id, f.product.name, f.lastUpdated
        ORDER BY f.lastUpdated DESC
    """)
    Page<FinishedGoodsReportProjection> findFinishedGoodsReport(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("productId") Integer productId,
            Pageable pageable);

    @Query("""
            SELECT 
                COUNT(DISTINCT f.product.id) AS totalProducts,
                COALESCE(SUM(f.boxQuantity), 0) AS totalBoxesProduced,
                COALESCE(SUM(f.loosePads), 0) AS totalLoosePadsProduced
            FROM FinishedGoodsStock f
            WHERE (:productId IS NULL OR f.product.id = :productId)
                AND f.lastUpdated BETWEEN :start AND :end
            """)
    FinishedGoodsReportSummaryProjection finindFinishedGoodsSummary(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("productId") Integer productId);
}
