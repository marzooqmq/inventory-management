package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.UnitType;
import lombok.Data;

@Data
public class ProductConversionRequestDTO {
    private Integer productId;
    private UnitType unitName;     // e.g., "CASE"
    private Integer boxesPerUnit;
}
