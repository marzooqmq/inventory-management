package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RawMaterialResponseDTO {
    private Integer id;
    private String name;
    private BigDecimal costPerUnit;
    private String purchaseUnit;
    private String consumptionUnit;
    private BigDecimal conversionFactor;
    private Boolean active;
}
