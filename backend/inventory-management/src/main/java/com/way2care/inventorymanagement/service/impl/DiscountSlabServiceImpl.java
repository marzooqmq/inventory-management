package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.DiscountSlabRequestDTO;
import com.way2care.inventorymanagement.dto.DiscountSlabResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.DiscountSlab;
import com.way2care.inventorymanagement.model.DiscountType;
import com.way2care.inventorymanagement.model.DiscountValueType;
import com.way2care.inventorymanagement.repository.DiscountSlabRepository;
import com.way2care.inventorymanagement.service.DiscountSlabService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscountSlabServiceImpl implements DiscountSlabService {

    private final DiscountSlabRepository discountSlabRepository;

    @Override
    public List<DiscountSlabResponseDTO> getAll() {
        return discountSlabRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public List<DiscountSlabResponseDTO> getActive() {
        return discountSlabRepository.findByActiveTrue().stream().map(this::toResponse).toList();
    }

    @Override
    public DiscountSlabResponseDTO create(DiscountSlabRequestDTO request) {

        validateRequest(request);

        DiscountSlab slab = DiscountSlab.builder()
                .discountType(request.getDiscountType())
                .minQuantity(request.getMinQuantity())
                .minAmount(request.getMinAmount())
                .discountValue(request.getDiscountValue())
                .discountValueType(request.getDiscountValueType())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .maxDiscountPercentage(request.getMaxDiscountPercentage())
                .offerName(request.getOfferName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .active(request.getActive())
                .build();
        DiscountSlab saved = discountSlabRepository.save(slab);
        return toResponse(saved);
    }

    @Override
    public DiscountSlabResponseDTO update(Integer id, DiscountSlabRequestDTO request) {
        DiscountSlab existing = discountSlabRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount Slab not found"));
        validateRequest(request);

        existing.setDiscountType(request.getDiscountType());
        existing.setMinQuantity(request.getMinQuantity());
        existing.setMinAmount(request.getMinAmount());
        existing.setDiscountValue(request.getDiscountValue());
        existing.setDiscountValueType(request.getDiscountValueType());
        existing.setMaxDiscountAmount(request.getMaxDiscountAmount());
        existing.setMaxDiscountPercentage(request.getMaxDiscountPercentage());
        existing.setOfferName(request.getOfferName());
        existing.setStartDate(request.getStartDate());
        existing.setEndDate(request.getEndDate());
        existing.setActive(request.getActive());
        discountSlabRepository.save(existing);
        return toResponse(existing);
    }

    @Override
    public void activate(Integer id) {
        DiscountSlab slab = discountSlabRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount Slab not found"));
        slab.setActive(true);
        discountSlabRepository.save(slab);
    }

    @Override
    public void deactivate(Integer id) {
        DiscountSlab slab = discountSlabRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount Slab not found"));
        slab.setActive(false);
        discountSlabRepository.save(slab);
    }

    private void validateRequest(DiscountSlabRequestDTO request) {

        if (request.getDiscountType() == null) {
            throw new IllegalArgumentException("Discount type is required");
        }

        if (request.getDiscountValue() == null || request.getDiscountValue().signum() <= 0) {
            throw new IllegalArgumentException("Discount value must be greater than zero");
        }

        if (request.getDiscountValueType() == null) {
            throw new IllegalArgumentException("Discount value type is required");
        }

        // ================= QUANTITY BASED =================
        if (request.getDiscountType() == DiscountType.QUANTITY) {
            if (request.getMinQuantity() == null || request.getMinQuantity() <= 0) {
                throw new IllegalArgumentException("Min Quantity must be greater than zero for QUANTITY discount");
            }
        }

        // ================= AMOUNT BASED =================
        if (request.getDiscountType() == DiscountType.AMOUNT) {
            if (request.getMinAmount() == null || request.getMinAmount().signum() <= 0) {
                throw new IllegalArgumentException("Min Amount must be greater than zero for AMOUNT discount");
            }
        }

        // ================= FESTIVAL / OFFER =================
        if (request.getDiscountType() == DiscountType.FESTIVAL) {
            if (request.getStartDate() == null || request.getEndDate() == null) {
                throw new IllegalArgumentException("Start Date and End Date are required for FESTIVAL discount");
            }
            if (request.getEndDate().isBefore(request.getStartDate())) {
                throw new IllegalArgumentException("End Date cannot be before Start Date");
            }
        }

        // ================= SAFETY CAPS =================
        if (request.getDiscountValueType() == DiscountValueType.PERCENTAGE &&
            request.getDiscountValue().compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("Percentage discount cannot exceed 100%");
        }

        if (request.getMaxDiscountAmount() != null && request.getMaxDiscountAmount().signum() <= 0) {
            throw new IllegalArgumentException("Max Discount Amount must be greater than zero");
        }

        if (request.getMaxDiscountPercentage() != null) {
            if (request.getMaxDiscountPercentage().signum() <= 0 ||
                request.getMaxDiscountPercentage().compareTo(new BigDecimal("100")) > 0) {
                throw new IllegalArgumentException("Max Discount Percentage must be greater than zero and cannot exceed 100%");
            }
        }
    }

    private DiscountSlabResponseDTO toResponse(DiscountSlab slab) {
        return DiscountSlabResponseDTO.builder()
                .id(slab.getId())
                .discountType(slab.getDiscountType())
                .minQuantity(slab.getMinQuantity())
                .minAmount(slab.getMinAmount())
                .discountValue(slab.getDiscountValue())
                .discountValueType(slab.getDiscountValueType())
                .maxDiscountAmount(slab.getMaxDiscountAmount())
                .maxDiscountPercentage(slab.getMaxDiscountPercentage())
                .offerName(slab.getOfferName())
                .startDate(slab.getStartDate())
                .endDate(slab.getEndDate())
                .active(slab.getActive())
                .build();
    }
}
