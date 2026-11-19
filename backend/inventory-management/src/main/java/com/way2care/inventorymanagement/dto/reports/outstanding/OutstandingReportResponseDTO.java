package com.way2care.inventorymanagement.dto.reports.outstanding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OutstandingReportResponseDTO {
    private List<OutstandingRecordDTO> records;
    private long totalCustomers;
    private BigDecimal totalOutstanding;
    private BigDecimal totalBucket0To30;
    private BigDecimal totalBucket31To60;
    private BigDecimal totalBucket61To90;
    private BigDecimal totalBucketAbove90;
}
