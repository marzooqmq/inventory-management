package com.way2care.inventorymanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String phone;
    private String address;
    private String district;
    private String state;
    private String country;
    private String zipCode;
    @Enumerated(EnumType.STRING)
    private CustomerType type; // Retail / Wholesale
    private Double discount; // Discount % automatically applied
}
