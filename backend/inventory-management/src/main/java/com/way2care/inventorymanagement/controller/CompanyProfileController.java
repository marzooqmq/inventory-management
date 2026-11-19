package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.CompanyProfileRequestDTO;
import com.way2care.inventorymanagement.dto.CompanyProfileResponseDTO;
import com.way2care.inventorymanagement.service.CompanyProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/company-profile")
@RequiredArgsConstructor
@Validated
public class CompanyProfileController {

    private final CompanyProfileService companyProfileService;

    @GetMapping
    public CompanyProfileResponseDTO getCompanyProfile() {
        return companyProfileService.getCompanyProfile();
    }

    @PostMapping
    public CompanyProfileResponseDTO createOrUpdateCompanyProfile(@Valid @RequestBody CompanyProfileRequestDTO request) {
        return companyProfileService.createOrUpdateCompanyProfile(request);
    }
}
