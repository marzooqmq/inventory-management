package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.CompanyProfileRequestDTO;
import com.way2care.inventorymanagement.dto.CompanyProfileResponseDTO;

public interface CompanyProfileService {
    CompanyProfileResponseDTO getCompanyProfile();
    CompanyProfileResponseDTO createOrUpdateCompanyProfile(CompanyProfileRequestDTO request);
}
