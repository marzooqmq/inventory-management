package com.way2care.inventorymanagement.dto.reports.productionOutput;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProductionOutputReportResponseDTO {
    private List<ProductionOutputReportDTO> records;

    private Long totalProducts;
    private BigDecimal totalBoxesProduced;

    private int page;
    private int size;
    private int totalPages;
    private long totalRecords;
}
