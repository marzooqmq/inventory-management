package com.way2care.inventorymanagement.dto.sales;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesDashboardDuesAgingDTO {
    private BigDecimal days0to30;
    private BigDecimal days31to60;
    private BigDecimal days61to90;
    private BigDecimal days90plus;
    private long count0to30;
    private long count31to60;
    private long count61to90;
    private long count90plus;
}
