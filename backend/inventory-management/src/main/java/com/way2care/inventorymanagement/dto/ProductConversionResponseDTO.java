package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.UnitType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductConversionResponseDTO {
    private Integer id;
    private Integer productId;
    private String productName;
    private UnitType unitName;
    private Integer boxesPerUnit;
}
