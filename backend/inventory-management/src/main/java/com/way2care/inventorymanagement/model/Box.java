package com.way2care.inventorymanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "product_box_cost")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Box {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private BigDecimal boxCostPerPad;
    private Boolean active;
    
    // Helper method to get name (fallback to product name)
    public String getName() {
        return product != null ? product.getName() + " Box" : "Unknown Box";
    }
    
    // Helper method to get unit price (now just returns boxCostPerPad)
    public BigDecimal getUnitPrice() {
        return boxCostPerPad != null ? boxCostPerPad : BigDecimal.ZERO;
    }
}
