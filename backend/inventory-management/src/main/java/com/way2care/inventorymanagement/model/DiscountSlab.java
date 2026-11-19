package com.way2care.inventorymanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "discount_slabs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountSlab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    private Integer minQuantity;
    private BigDecimal minAmount;
    private BigDecimal discountValue;

    @Enumerated(EnumType.STRING)
    private DiscountValueType discountValueType;

    private BigDecimal maxDiscountAmount;      // ₹
    private BigDecimal maxDiscountPercentage;  // %

    private String offerName;

    private LocalDate startDate;
    private LocalDate endDate;

    private Boolean active;
}
