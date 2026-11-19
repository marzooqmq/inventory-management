package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.RawMaterialStockRequestDTO;
import com.way2care.inventorymanagement.dto.RawMaterialStockResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.RawMaterial;
import com.way2care.inventorymanagement.model.RawMaterialStock;
import com.way2care.inventorymanagement.repository.RawMaterialRepository;
import com.way2care.inventorymanagement.repository.RawMaterialStockRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RawMaterialStockServiceImplTest {

    @Mock private RawMaterialStockRepository rawMaterialStockRepository;
    @Mock private RawMaterialRepository rawMaterialRepository;

    @InjectMocks private RawMaterialStockServiceImpl rawMaterialStockService;

    @Test
    void createStoresStockForExistingMaterial() {
        RawMaterial material = RawMaterial.builder().id(6).name("Cotton").build();
        RawMaterialStockRequestDTO request = request(6, "500.00", "100.00");
        when(rawMaterialStockRepository.existsByMaterialId(6)).thenReturn(false);
        when(rawMaterialRepository.findById(6)).thenReturn(Optional.of(material));
        when(rawMaterialStockRepository.save(any(RawMaterialStock.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RawMaterialStockResponseDTO response = rawMaterialStockService.create(request);

        assertEquals(6, response.getMaterialId());
        assertEquals("Cotton", response.getMaterialName());
        assertEquals(new BigDecimal("500.00"), response.getQuantity());
        assertEquals(new BigDecimal("100.00"), response.getMinStockLevel());

        ArgumentCaptor<RawMaterialStock> stockCaptor =
                ArgumentCaptor.forClass(RawMaterialStock.class);
        verify(rawMaterialStockRepository).save(stockCaptor.capture());
        assertSame(material, stockCaptor.getValue().getMaterial());
    }

    @Test
    void createRejectsDuplicateMaterialStock() {
        when(rawMaterialStockRepository.existsByMaterialId(6)).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> rawMaterialStockService.create(request(6, "500.00", "100.00")));

        verifyNoInteractions(rawMaterialRepository);
        verify(rawMaterialStockRepository, never()).save(any());
    }

    @Test
    void createFailsWhenMaterialDoesNotExist() {
        when(rawMaterialStockRepository.existsByMaterialId(404)).thenReturn(false);
        when(rawMaterialRepository.findById(404)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> rawMaterialStockService.create(request(404, "500.00", "100.00")));

        verify(rawMaterialStockRepository, never()).save(any());
    }

    private RawMaterialStockRequestDTO request(Integer materialId, String quantity, String minStockLevel) {
        RawMaterialStockRequestDTO request = new RawMaterialStockRequestDTO();
        request.setMaterialId(materialId);
        request.setQuantity(new BigDecimal(quantity));
        request.setMinStockLevel(new BigDecimal(minStockLevel));
        return request;
    }
}
