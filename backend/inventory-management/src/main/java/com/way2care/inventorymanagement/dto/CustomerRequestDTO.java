package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.CustomerType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CustomerRequestDTO {
    @NotBlank(message = "Name cannot be empty")
    private String name;

    @NotBlank(message = "Phone number cannot be empty")
    private String phone;

    @NotBlank(message = "Address cannot be empty")
    private String address;

    @NotBlank(message = "District cannot be empty")
    private String district;

    @NotBlank(message = "State cannot be empty")
    private String state;

    @NotBlank(message = "Country cannot be empty")
    private String country;

    @NotBlank(message = "Zipcode cannot be empty")
    private String zipCode;

    @Enumerated(EnumType.STRING)
    private CustomerType type;  // Retail / Wholesale

    private Double discount;
}
