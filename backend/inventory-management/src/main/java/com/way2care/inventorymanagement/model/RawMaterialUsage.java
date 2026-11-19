package com.way2care.inventorymanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_material_usages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RawMaterialUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "production_order_id")
    private ProductionOrder productionOrder;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private RawMaterial material;

    private BigDecimal qtyUsed;
    private BigDecimal wastage;
    private LocalDateTime timestamp;

    @PrePersist
    @PreUpdate
    protected void updateTimestamp() {
        timestamp = LocalDateTime.now();
    }

}
