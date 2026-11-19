package com.way2care.inventorymanagement.dto.reports.productionExecution;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StageProgressResponseDTO {
    private List<StageProgressOrderDTO> records;

    private int page;
    private int size;
    private int totalPages;
    private long totalRecords;
}
