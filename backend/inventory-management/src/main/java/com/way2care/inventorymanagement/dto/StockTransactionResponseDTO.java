package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.StockItemType;
import com.way2care.inventorymanagement.model.StockTransactionType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class StockTransactionResponseDTO {
    private StockTransactionType type;
    private StockItemType itemType;

    private Integer itemId;
    private BigDecimal quantity;

    private String module;
    private Integer moduleId;

    private LocalDateTime timestamp;
}
