package com.way2care.inventorymanagement.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionDailyDTO {
    private Integer productId;
    private String productName;
    private String productCategory;
    private Long quantityProduced;
    private LocalDate productionDate;
}
