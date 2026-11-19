package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.dto.reports.productionExecution.StageProgressProjection;
import com.way2care.inventorymanagement.model.ProductionOrder;
import com.way2care.inventorymanagement.model.ProductionStage;
import com.way2care.inventorymanagement.model.ProductionStageStatus;
import com.way2care.inventorymanagement.model.ProductionStageExecution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionStageExecutionRepository extends JpaRepository<ProductionStageExecution, Integer> {
    
    List<ProductionStageExecution> findByProductionOrderId(Integer productionOrderId);
    
    boolean existsByProductionOrderAndStageAndStatus(
            ProductionOrder order,
            ProductionStage stage,
            ProductionStageStatus status
    );

    Optional<ProductionStageExecution> findFirstByProductionOrderAndStageOrderByExecutedAtDesc(
            ProductionOrder order,
            ProductionStage stage
    );

    @Query(value = """
            SELECT COALESCE(SUM(pse.output_qty), 0) 
            FROM production_stage_executions pse
            WHERE pse.production_order_id = :orderId
            AND pse.stage = :stage
            """, nativeQuery = true)
    Integer sumOutputQtyByProductionOrderAndStage(Integer orderId, String stage);

    @Query("""
            SELECT MAX(pse.executedAt) 
            FROM ProductionStageExecution pse 
            WHERE pse.productionOrder.id = :orderId 
            AND pse.stage = 'PACKING'
            """)
    Optional<LocalDateTime> findMaxExecutedAtByProductionOrderIdAndPackingStage(Integer orderId);

    @Query("""
            SELECT 
                pse.productionOrder.id AS productionOrderId,
                pse.productionOrder.product.name AS productName,
                pse.stage AS stage,
                pse.status AS stageStatus,
                pse.inputQty AS inputQty,
                pse.outputQty AS outputQty,
                pse.balanceQty AS balanceQty,
                pse.executedAt AS executedAt
            FROM ProductionStageExecution pse
            WHERE pse.executedAt BETWEEN :start AND :end
            ORDER BY pse.executedAt DESC
            """)
    Page<StageProgressProjection> findStageProgressReport(LocalDateTime start, LocalDateTime end, Pageable pageable);
}
