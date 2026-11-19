package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.CompanyProfileRequestDTO;
import com.way2care.inventorymanagement.dto.CompanyProfileResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.CompanyProfile;
import com.way2care.inventorymanagement.repository.CompanyProfileRepository;
import com.way2care.inventorymanagement.service.CompanyProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyProfileServiceImpl implements CompanyProfileService {

    private final CompanyProfileRepository companyProfileRepository;

    @Override
    public CompanyProfileResponseDTO getCompanyProfile() {
        CompanyProfile profile = companyProfileRepository.findAll()
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Company Profile not found"));
        return toResponse(profile);
    }

    @Override
    public CompanyProfileResponseDTO createOrUpdateCompanyProfile(CompanyProfileRequestDTO request) {
        CompanyProfile profile = companyProfileRepository.findAll().stream().findFirst()
                .orElse(CompanyProfile.builder().build());

        profile.setCompanyName(request.getCompanyName());
        profile.setAddressLine1(request.getAddressLine1());
        profile.setAddressLine2(request.getAddressLine2());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setZipCode(request.getZipCode());
        profile.setCountry(request.getCountry());
        profile.setGstin(request.getGstin());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setEmail(request.getEmail());
        profile.setBankName(request.getBankName());
        profile.setBankAccountNumber(request.getBankAccountNumber());
        profile.setBankIfscCode(request.getBankIfscCode());
        profile.setLogoUrl(request.getLogoUrl());

        CompanyProfile saved = companyProfileRepository.save(profile);
        return toResponse(saved);
    }

    private CompanyProfileResponseDTO toResponse(CompanyProfile profile) {
        return CompanyProfileResponseDTO.builder()
                .id(profile.getId())
                .companyName(profile.getCompanyName())
                .addressLine1(profile.getAddressLine1())
                .addressLine2(profile.getAddressLine2())
                .city(profile.getCity())
                .state(profile.getState())
                .zipCode(profile.getZipCode())
                .country(profile.getCountry())
                .gstin(profile.getGstin())
                .phoneNumber(profile.getPhoneNumber())
                .email(profile.getEmail())
                .bankName(profile.getBankName())
                .bankAccountNumber(profile.getBankAccountNumber())
                .bankIfscCode(profile.getBankIfscCode())
                .build();
    }
}
