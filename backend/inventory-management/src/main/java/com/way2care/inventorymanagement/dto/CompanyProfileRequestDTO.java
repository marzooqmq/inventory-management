package com.way2care.inventorymanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyProfileRequestDTO {

    @NotBlank
    private String companyName;

    @NotBlank
    private String addressLine1;
    private String addressLine2;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String zipCode;

    @NotBlank
    private String country;

    @NotBlank
    private String gstin;

    private String phoneNumber;
    private String email;

    private String bankName;
    private String bankAccountNumber;
    private String bankIfscCode;

    private String logoUrl;
}
