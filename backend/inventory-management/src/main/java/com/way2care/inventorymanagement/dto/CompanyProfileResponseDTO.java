package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompanyProfileResponseDTO {

    private Integer id;
    private String companyName;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String gstin;
    private String phoneNumber;
    private String email;
    private String bankName;
    private String bankAccountNumber;
    private String bankIfscCode;
}
