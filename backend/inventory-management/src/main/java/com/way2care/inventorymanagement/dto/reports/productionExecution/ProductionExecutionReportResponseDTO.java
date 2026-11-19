package com.way2care.inventorymanagement.dto.reports.productionExecution;

import com.way2care.inventorymanagement.dto.ProductionReportDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProductionExecutionReportResponseDTO {
    private List<ProductionReportDTO> records;
    private Integer totalOrders;
    private Integer totalProducedQty;

    private int page;
    private int size;
    private int totalPages;
    private long totalRecords;
}
