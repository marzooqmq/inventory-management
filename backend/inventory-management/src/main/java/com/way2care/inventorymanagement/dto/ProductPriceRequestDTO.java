package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.CustomerType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductPriceRequestDTO {
    private Integer productId;
    private CustomerType customerType;
    private BigDecimal pricePerBox;
}
