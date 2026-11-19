package com.way2care.inventorymanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "production_costs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private BigDecimal labourCost;
    private BigDecimal transportCost;
    private BigDecimal herbalCost;
    private BigDecimal machineCost;
    private BigDecimal overheadCost;

    private BigDecimal totalCost;
}
