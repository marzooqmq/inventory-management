package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.DiscountResponseDTO;
import com.way2care.inventorymanagement.model.DiscountSlab;
import com.way2care.inventorymanagement.model.DiscountType;
import com.way2care.inventorymanagement.model.DiscountValueType;
import com.way2care.inventorymanagement.repository.DiscountSlabRepository;
import com.way2care.inventorymanagement.service.DiscountCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscountCalculationServiceImpl implements DiscountCalculationService {

    private final DiscountSlabRepository discountSlabRepository;

    @Override
    public DiscountResponseDTO calculateDiscount(
            Integer totalBoxes, BigDecimal totalAmount, BigDecimal totalCostPrice, LocalDate invoiceDate) {

        List<DiscountSlab> activeSlabs = discountSlabRepository.findByActiveTrue();

        // 1. Festival Offer Discount
        DiscountSlab festivalSlab = activeSlabs.stream()
                .filter(slab -> slab.getDiscountType() == DiscountType.FESTIVAL)
                .filter(slab -> !invoiceDate.isBefore(slab.getStartDate()) && !invoiceDate.isAfter(slab.getEndDate()))
                .findFirst()
                .orElse(null);

        if(festivalSlab != null) {
            BigDecimal discount = calculateDiscountValue(festivalSlab, totalAmount);
            discount = applyMaxLimits(festivalSlab, discount, totalAmount, totalCostPrice);
            return new DiscountResponseDTO(discount, DiscountType.FESTIVAL, festivalSlab.getOfferName());
        }

        // 2. Quantity Based Discount
        DiscountSlab quantitySlab = activeSlabs.stream()
                .filter(slab -> slab.getDiscountType() == DiscountType.QUANTITY)
                .filter(slab -> totalBoxes >= slab.getMinQuantity())
                .max(Comparator.comparing(DiscountSlab::getMinQuantity))
                .orElse(null);

        // 3. Amount Based Discount
        DiscountSlab amountSlab = activeSlabs.stream()
                .filter(slab -> slab.getDiscountType() == DiscountType.AMOUNT)
                .filter(slab -> totalAmount.compareTo(slab.getMinAmount()) >= 0)
                .max(Comparator.comparing(DiscountSlab::getMinAmount))
                .orElse(null);

        DiscountSlab selectedSlab = bestDiscountSlab(quantitySlab, amountSlab, totalAmount);

        if(selectedSlab == null) {
            return new DiscountResponseDTO(BigDecimal.ZERO, null, null);
        }

        BigDecimal discount = calculateDiscountValue(selectedSlab, totalAmount);
        discount = applyMaxLimits(selectedSlab, discount, totalAmount, totalCostPrice);

        return new DiscountResponseDTO(discount, selectedSlab.getDiscountType(), selectedSlab.getOfferName());
    }

    // ---------------- HELPERS METHODS ----------------

    private DiscountSlab bestDiscountSlab(DiscountSlab slab1, DiscountSlab slab2, BigDecimal totalAmount) {
        if(slab1 == null) return slab2;
        if(slab2 == null) return slab1;

        BigDecimal discount1 = calculateDiscountValue(slab1, totalAmount);
        BigDecimal discount2 = calculateDiscountValue(slab2, totalAmount);

        return discount1.compareTo(discount2) >= 0 ? slab1 : slab2;
    }

    private BigDecimal calculateDiscountValue(DiscountSlab slab, BigDecimal totalAmount) {
        if(slab.getDiscountValueType() == DiscountValueType.PERCENTAGE) {
            return totalAmount.multiply(slab.getDiscountValue()).divide(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
        }
        return slab.getDiscountValue().setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal applyMaxLimits(DiscountSlab slab, BigDecimal discount, BigDecimal totalAmount, BigDecimal totalCostPrice) {

        // Max percentage cap
        if(slab.getMaxDiscountPercentage() != null) {
            BigDecimal maxByPercentage = totalAmount.multiply(slab.getMaxDiscountPercentage()).divide(BigDecimal.valueOf(100));
            discount = discount.min(maxByPercentage);
        }

        // Max amount cap
        if(slab.getMaxDiscountAmount() != null) {
            discount = discount.min(slab.getMaxDiscountAmount());
        }

        // Profit protection cap
        BigDecimal maxAllowedDiscount = totalAmount.subtract(totalCostPrice);
        return discount.min(maxAllowedDiscount.max(BigDecimal.ZERO)).setScale(2, RoundingMode.HALF_UP);
    }
}
