package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.ProductCostHistoryRequestDTO;
import com.way2care.inventorymanagement.dto.ProductCostHistoryResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.ProductCostHistory;
import com.way2care.inventorymanagement.repository.ProductCostHistoryRepository;
import com.way2care.inventorymanagement.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductCostHistoryServiceImplTest {

    @Mock private ProductRepository productRepository;
    @Mock private ProductCostHistoryRepository productCostHistoryRepository;

    @InjectMocks private ProductCostHistoryServiceImpl costHistoryService;

    @Test
    void approveCostRecordsHistoryAndUpdatesCurrentProductCost() {
        Product product = Product.builder()
                .id(12)
                .name("Test Product")
                .costDirty(true)
                .build();
        BigDecimal approvedCost = new BigDecimal("125.50");
        LocalDateTime effectiveDate = LocalDateTime.parse("2026-10-01T09:30:00");
        ProductCostHistoryRequestDTO request = ProductCostHistoryRequestDTO.builder()
                .productId(12)
                .costPerBox(approvedCost)
                .validFrom(effectiveDate)
                .build();
        when(productRepository.findById(12)).thenReturn(Optional.of(product));
        when(productCostHistoryRepository.save(any(ProductCostHistory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(productRepository.save(product)).thenReturn(product);

        ProductCostHistoryResponseDTO response = costHistoryService.approveCost(request);

        assertEquals(12, response.getProductId());
        assertEquals("Test Product", response.getProductName());
        assertEquals(approvedCost, response.getCostPerBox());
        assertEquals(effectiveDate, response.getValidFrom());
        assertEquals(approvedCost, product.getCostPrice());
        assertEquals(approvedCost, product.getCalculatedCostPrice());
        assertFalse(product.getCostDirty());
        assertNotNull(product.getCostCalculatedAt());

        ArgumentCaptor<ProductCostHistory> historyCaptor =
                ArgumentCaptor.forClass(ProductCostHistory.class);
        verify(productCostHistoryRepository).save(historyCaptor.capture());
        assertSame(product, historyCaptor.getValue().getProduct());
        assertEquals(approvedCost, historyCaptor.getValue().getCostPerBox());
        assertEquals(effectiveDate, historyCaptor.getValue().getValidFrom());
        verify(productRepository).save(product);
    }

    @Test
    void approveCostUsesCurrentTimeWhenEffectiveDateIsNotProvided() {
        Product product = Product.builder().id(12).name("Test Product").build();
        ProductCostHistoryRequestDTO request = ProductCostHistoryRequestDTO.builder()
                .productId(12)
                .costPerBox(new BigDecimal("80.00"))
                .build();
        when(productRepository.findById(12)).thenReturn(Optional.of(product));
        when(productCostHistoryRepository.save(any(ProductCostHistory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProductCostHistoryResponseDTO response = costHistoryService.approveCost(request);

        assertNotNull(response.getValidFrom());
        verify(productRepository).save(product);
    }

    @Test
    void approveCostFailsWhenProductDoesNotExist() {
        ProductCostHistoryRequestDTO request = ProductCostHistoryRequestDTO.builder()
                .productId(404)
                .costPerBox(new BigDecimal("80.00"))
                .build();
        when(productRepository.findById(404)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> costHistoryService.approveCost(request));

        verifyNoInteractions(productCostHistoryRepository);
        verify(productRepository, never()).save(any());
    }
}
