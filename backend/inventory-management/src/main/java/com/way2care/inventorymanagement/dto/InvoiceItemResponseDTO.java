package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.UnitType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class InvoiceItemResponseDTO {
    private Integer productId;
    private String productName;
    private Integer quantity;
    private UnitType unitType;
    private Integer quantityInBoxes;
    private BigDecimal rate;
    private BigDecimal total;
}
