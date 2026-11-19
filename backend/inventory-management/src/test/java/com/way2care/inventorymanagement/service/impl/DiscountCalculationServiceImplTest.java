package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.DiscountResponseDTO;
import com.way2care.inventorymanagement.model.DiscountSlab;
import com.way2care.inventorymanagement.model.DiscountType;
import com.way2care.inventorymanagement.model.DiscountValueType;
import com.way2care.inventorymanagement.repository.DiscountSlabRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiscountCalculationServiceImplTest {

    @Mock private DiscountSlabRepository discountSlabRepository;

    @InjectMocks private DiscountCalculationServiceImpl discountCalculationService;

    @Test
    void calculateDiscountReturnsZeroWhenThereAreNoActiveOffers() {
        when(discountSlabRepository.findByActiveTrue()).thenReturn(List.of());

        DiscountResponseDTO response = discountCalculationService.calculateDiscount(
                2, new BigDecimal("500.00"), new BigDecimal("300.00"), LocalDate.now());

        assertEquals(BigDecimal.ZERO, response.getDiscountAmount());
        assertNull(response.getDiscountType());
        assertNull(response.getOfferName());
    }

    @Test
    void calculateDiscountSelectsTheBestEligibleQuantityOrAmountOffer() {
        DiscountSlab quantityOffer = slab(DiscountType.QUANTITY, 10, null,
                "15", DiscountValueType.PERCENTAGE, "Quantity offer");
        DiscountSlab amountOffer = slab(DiscountType.AMOUNT, null, "1000.00",
                "5", DiscountValueType.PERCENTAGE, "Amount offer");
        when(discountSlabRepository.findByActiveTrue()).thenReturn(List.of(quantityOffer, amountOffer));

        DiscountResponseDTO response = discountCalculationService.calculateDiscount(
                12, new BigDecimal("2000.00"), new BigDecimal("1000.00"), LocalDate.now());

        assertEquals(DiscountType.QUANTITY, response.getDiscountType());
        assertEquals("Quantity offer", response.getOfferName());
        assertEquals(new BigDecimal("300.00"), response.getDiscountAmount());
    }

    @Test
    void calculateDiscountPrefersEligibleFestivalOfferAndProtectsCost() {
        LocalDate today = LocalDate.now();
        DiscountSlab festivalOffer = DiscountSlab.builder()
                .discountType(DiscountType.FESTIVAL)
                .discountValue(new BigDecimal("30"))
                .discountValueType(DiscountValueType.PERCENTAGE)
                .startDate(today.minusDays(1))
                .endDate(today.plusDays(1))
                .offerName("Festival offer")
                .active(true)
                .build();
        when(discountSlabRepository.findByActiveTrue()).thenReturn(List.of(festivalOffer));

        DiscountResponseDTO response = discountCalculationService.calculateDiscount(
                1, new BigDecimal("100.00"), new BigDecimal("90.00"), today);

        assertEquals(DiscountType.FESTIVAL, response.getDiscountType());
        assertEquals("Festival offer", response.getOfferName());
        assertEquals(new BigDecimal("10.00"), response.getDiscountAmount());
    }

    private DiscountSlab slab(
            DiscountType type,
            Integer minQuantity,
            String minAmount,
            String discountValue,
            DiscountValueType valueType,
            String offerName) {
        return DiscountSlab.builder()
                .discountType(type)
                .minQuantity(minQuantity)
                .minAmount(minAmount == null ? null : new BigDecimal(minAmount))
                .discountValue(new BigDecimal(discountValue))
                .discountValueType(valueType)
                .offerName(offerName)
                .active(true)
                .build();
    }
}
