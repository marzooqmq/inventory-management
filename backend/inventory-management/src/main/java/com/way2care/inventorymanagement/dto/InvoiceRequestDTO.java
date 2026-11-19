package com.way2care.inventorymanagement.dto;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class InvoiceRequestDTO {

    @NotNull(message = "Customer ID is required")
    private Integer customerId;

    private List<InvoiceItemRequestDTO> items;
}
