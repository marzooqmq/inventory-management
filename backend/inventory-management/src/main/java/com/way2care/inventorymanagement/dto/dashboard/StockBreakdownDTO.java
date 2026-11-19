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
public class StockBreakdownDTO {
    private BigDecimal rawMaterialStockValue;
    private Long rawMaterialStockCount;
    private BigDecimal finishedGoodsStockValue;
    private Long finishedGoodsStockCount;
    private BigDecimal boxStockValue;
    private Long boxStockCount;
}
