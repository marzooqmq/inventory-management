package com.way2care.inventorymanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    private StockTransactionType type;

    @Enumerated(EnumType.STRING)
    private StockItemType itemType; // Product or Raw Material

    private Integer itemId; // raw material or product
    private BigDecimal quantity;
    private String module; // e.g., Purchase, Sale, Return
    private Integer moduleId; // e.g., Purchase ID, Sale ID
    private Integer userId; // User who performed the transaction
    private LocalDateTime timestamp;
}
