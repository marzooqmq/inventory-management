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
public class SalesDashboardTopCustomerDTO {
    private Integer customerId;
    private String customerName;
    private long invoiceCount;
    private BigDecimal totalRevenue;
}
