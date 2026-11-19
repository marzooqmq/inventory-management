package com.way2care.inventorymanagement.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerResponseDTO {
    private Integer id;
    private String name;
    private String phone;
    private String address;
    private String district;
    private String state;
    private String country;
    private String zipCode;
    private String type;
    private Double discount;
}
