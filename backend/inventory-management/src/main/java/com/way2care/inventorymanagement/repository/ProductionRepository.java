package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.dto.reports.productionExecution.ProductionExecutionReportProjection;
import com.way2care.inventorymanagement.dto.reports.productionExecution.ProductionExecutionSummaryProjection;
import com.way2care.inventorymanagement.model.Production;
import com.way2care.inventorymanagement.model.ProductionOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductionRepository extends JpaRepository<Production, Integer> {
    Iterable<? extends Production> findByProductionOrder(ProductionOrder productionOrder);

    @Query("""
            SELECT 
                po.id AS productionOrderId,
                p.name AS productName,
                po.quantity AS orderQty,
                COALESCE(SUM(pr.quantityProduced), 0) AS producedQty,
                po.status AS orderStatus,
                po.startDate AS startDate,
                po.endDate AS endDate
            FROM Production pr
            JOIN pr.productionOrder po
            JOIN po.product p
            WHERE pr.timestamp BETWEEN :start AND :end
            GROUP BY 
                po.id, p.name, po.quantity, po.status, po.startDate, po.endDate
            """)
    Page<ProductionExecutionReportProjection> findProductionExecutionReport(
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable);

    @Query("""
            SELECT 
                COUNT(DISTINCT po.id) AS totalOrders,
                COALESCE(SUM(pr.quantityProduced), 0) AS totalProducedQty
            FROM Production pr
            JOIN pr.productionOrder po
            WHERE pr.timestamp BETWEEN :start AND :end
            """)
    ProductionExecutionSummaryProjection findProductionExecutionSummary(
            LocalDateTime start,
            LocalDateTime end);
    
    // For inventory dashboard
    List<Production> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
