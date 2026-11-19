package com.way2care.inventorymanagement.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopProductDTO {
    private Integer productId;
    private String productName;
    private Long stockQuantity; // Total pads
    private Integer boxQuantity;
    private Integer loosePads;
    private BigDecimal stockValue;
    private Long transactionCount;
}
