package com.way2care.inventorymanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;

    @Enumerated(EnumType.STRING)
    private ProductCategory category;

    @Enumerated(EnumType.STRING)
    private ProductSize size;
    private String description;
    private Integer padsPerBox;
    private BigDecimal mrp;
    private BigDecimal costPrice;
    private BigDecimal calculatedCostPrice;
    private Boolean costDirty = false;
    private LocalDateTime costCalculatedAt;
    private Boolean active;
}
