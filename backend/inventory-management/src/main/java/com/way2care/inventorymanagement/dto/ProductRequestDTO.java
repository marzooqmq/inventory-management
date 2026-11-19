package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.ProductCategory;
import com.way2care.inventorymanagement.model.ProductSize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequestDTO {
    @NotBlank(message = "Product name cannot be empty")
    private String name;

    @NotNull(message = "Category cannot be empty")
    private ProductCategory category;

    @NotNull(message = "Size cannot be null")
    private ProductSize size;

    private String description;

    @NotNull(message = "Pads per box cannot be null")
    private Integer padsPerBox;

    @NotNull(message = "MRP cannot be null")
    private BigDecimal mrp;

    @NotNull(message = "Active status is required")
    private Boolean active;
}
