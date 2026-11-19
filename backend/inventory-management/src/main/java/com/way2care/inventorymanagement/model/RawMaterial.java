package com.way2care.inventorymanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Entity
@Table(name = "raw_materials")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RawMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private BigDecimal costPerUnit;
    private String purchaseUnit;
    private String consumptionUnit;
    private BigDecimal conversionFactor; // e.g., if purchase in kg and consume in g, factor is 1000
    private Boolean active;
    
    // Helper method to get unit price (now just returns costPerUnit)
    public BigDecimal getUnitPrice() {
        return costPerUnit != null ? costPerUnit : BigDecimal.ZERO;
    }
}
