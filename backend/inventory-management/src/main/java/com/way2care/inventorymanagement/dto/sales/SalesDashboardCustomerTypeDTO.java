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
public class SalesDashboardCustomerTypeDTO {
    private BigDecimal distributorRevenue;
    private BigDecimal dealerRevenue;
    private BigDecimal directCustomerRevenue;
    private long distributorCount;
    private long dealerCount;
    private long directCustomerCount;
}
