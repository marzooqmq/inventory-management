package com.way2care.inventorymanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "company_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    private String logoUrl;
}
