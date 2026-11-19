package com.way2care.inventorymanagement.dto.reports.finishedgoods;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FinishedGoodsReportResponseDTO {
    private List<FinishedGoodsReportDTO> records;
    private Integer totalProducts;
    private Integer totalBoxesProduced;
    private Integer totalLoosePadsProduced;

    private int page;
    private int size;
    private int totalPages;
    private long totalRecords;
}
