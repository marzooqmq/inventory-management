package com.way2care.inventorymanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "raw_material_stocks",
        uniqueConstraints = @UniqueConstraint(columnNames = "material_id", name = "uk_material_id"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RawMaterialStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private RawMaterial material;

    private BigDecimal quantity;
    private BigDecimal minStockLevel;
    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    protected void updateTimestamp() {
        lastUpdated = LocalDateTime.now();
    }
}
