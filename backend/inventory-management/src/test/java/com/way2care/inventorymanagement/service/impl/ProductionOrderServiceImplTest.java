package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.ProductionOrderRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionOrderResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.ProductionOrder;
import com.way2care.inventorymanagement.model.ProductionOrderStatus;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.repository.ProductionOrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductionOrderServiceImplTest {

    @Mock private ProductionOrderRepository productionOrderRepository;
    @Mock private ProductRepository productRepository;

    @InjectMocks private ProductionOrderServiceImpl productionOrderService;

    @Test
    void createStartsOrderInCreatedStateForExistingProduct() {
        Product product = Product.builder().id(5).name("Test Product").build();
        ProductionOrderRequestDTO request = request(5, 120);
        when(productRepository.findById(5)).thenReturn(Optional.of(product));
        when(productionOrderRepository.save(any(ProductionOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProductionOrderResponseDTO response = productionOrderService.create(request);

        assertEquals("Test Product", response.getProductName());
        assertEquals(120, response.getQuantity());
        assertEquals(ProductionOrderStatus.CREATED, response.getStatus());
        assertEquals(LocalDate.now(), response.getStartDate());

        ArgumentCaptor<ProductionOrder> orderCaptor =
                ArgumentCaptor.forClass(ProductionOrder.class);
        verify(productionOrderRepository).save(orderCaptor.capture());
        assertSame(product, orderCaptor.getValue().getProduct());
    }

    @Test
    void createFailsWhenProductDoesNotExist() {
        when(productRepository.findById(404)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> productionOrderService.create(request(404, 10)));

        verifyNoInteractions(productionOrderRepository);
    }

    @Test
    void updateChangesOnlyFieldsProvidedInRequest() {
        Product existingProduct = Product.builder().id(5).name("Old Product").build();
        ProductionOrder order = ProductionOrder.builder()
                .id(3)
                .product(existingProduct)
                .quantity(10)
                .status(ProductionOrderStatus.CREATED)
                .startDate(LocalDate.now())
                .build();
        ProductionOrderRequestDTO request = new ProductionOrderRequestDTO();
        request.setQuantity(25);
        when(productionOrderRepository.findById(3)).thenReturn(Optional.of(order));
        when(productionOrderRepository.save(order)).thenReturn(order);

        ProductionOrderResponseDTO response = productionOrderService.update(3, request);

        assertEquals(25, response.getQuantity());
        assertEquals("Old Product", response.getProductName());
        verify(productRepository, never()).findById(any());
        verify(productionOrderRepository).save(order);
    }

    private ProductionOrderRequestDTO request(Integer productId, Integer quantity) {
        ProductionOrderRequestDTO request = new ProductionOrderRequestDTO();
        request.setProductId(productId);
        request.setQuantity(quantity);
        return request;
    }
}
