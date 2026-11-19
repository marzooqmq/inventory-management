package com.way2care.inventorymanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "production_stage_executions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionStageExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "production_order_id")
    private ProductionOrder productionOrder;

    @Enumerated(EnumType.STRING)
    private ProductionStage stage;

    private Integer inputQty;
    private Integer outputQty;
    private Integer balanceQty;

    @Enumerated(EnumType.STRING)
    private ProductionStageStatus status;

    private LocalDateTime executedAt;

    @PrePersist
    void onCreate() {
        executedAt = LocalDateTime.now();
    }
}
