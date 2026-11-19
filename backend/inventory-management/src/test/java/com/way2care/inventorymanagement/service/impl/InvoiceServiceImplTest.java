package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.DiscountResponseDTO;
import com.way2care.inventorymanagement.dto.InvoiceItemRequestDTO;
import com.way2care.inventorymanagement.dto.InvoiceRequestDTO;
import com.way2care.inventorymanagement.dto.InvoiceResponseDTO;
import com.way2care.inventorymanagement.exception.InsufficientStockException;
import com.way2care.inventorymanagement.model.*;
import com.way2care.inventorymanagement.repository.*;
import com.way2care.inventorymanagement.service.DiscountCalculationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceImplTest {

    @Mock private InvoiceRepository invoiceRepository;
    @Mock private InvoiceItemRepository invoiceItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private FinishedGoodsStockRepository finishedGoodsStockRepository;
    @Mock private StockTransactionRepository stockTransactionRepository;
    @Mock private DiscountCalculationService discountCalculationService;
    @Mock private ProductPriceRepository productPriceRepository;
    @Mock private ProductConversionRepository productConversionRepository;

    @InjectMocks private InvoiceServiceImpl invoiceService;

    private Customer customer;
    private Product product;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .id(7)
                .name("Test Customer")
                .phone("0000000000")
                .type(CustomerType.DISTRIBUTOR)
                .build();
        product = Product.builder()
                .id(4)
                .name("Test Product")
                .costPrice(new BigDecimal("20.00"))
                .build();
    }

    @Test
    void createCaseInvoiceConvertsBoxesAndDeductsStock() {
        FinishedGoodsStock stock = FinishedGoodsStock.builder()
                .product(product)
                .boxQuantity(20)
                .build();
        ProductConversion conversion = ProductConversion.builder()
                .product(product)
                .unitName(UnitType.CASE)
                .boxesPerUnit(3)
                .build();
        ProductPrice price = ProductPrice.builder()
                .product(product)
                .customerType(CustomerType.DISTRIBUTOR)
                .pricePerBox(new BigDecimal("100.00"))
                .build();
        InvoiceItemRequestDTO itemRequest = itemRequest(2, UnitType.CASE);
        InvoiceRequestDTO request = invoiceRequest(itemRequest);

        when(invoiceRepository.countByInvoiceNumberStartingWith(anyString())).thenReturn(0L);
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(customerRepository.findById(7)).thenReturn(Optional.of(customer));
        when(productRepository.findById(4)).thenReturn(Optional.of(product));
        when(productConversionRepository.findByProductAndUnitName(product, UnitType.CASE))
                .thenReturn(Optional.of(conversion));
        when(productPriceRepository.findByProductAndCustomerType(product, CustomerType.DISTRIBUTOR))
                .thenReturn(Optional.of(price));
        when(finishedGoodsStockRepository.findByProduct(product)).thenReturn(Optional.of(stock));
        when(discountCalculationService.calculateDiscount(
                eq(6), eq(new BigDecimal("600.00")), eq(new BigDecimal("120.00")), any()))
                .thenReturn(new DiscountResponseDTO(
                        new BigDecimal("50.00"), DiscountType.AMOUNT, "Volume offer"));
        when(invoiceItemRepository.save(any(InvoiceItem.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(invoiceItemRepository.findByInvoice(any(Invoice.class))).thenReturn(List.of());

        InvoiceResponseDTO response = invoiceService.create(request);

        assertEquals(new BigDecimal("600.00"), response.getTotalAmount());
        assertEquals(new BigDecimal("50.00"), response.getDiscount());
        assertEquals(new BigDecimal("550.00"), response.getNetAmount());
        assertEquals(14, stock.getBoxQuantity());

        ArgumentCaptor<InvoiceItem> itemCaptor = ArgumentCaptor.forClass(InvoiceItem.class);
        verify(invoiceItemRepository).save(itemCaptor.capture());
        assertEquals(2, itemCaptor.getValue().getQuantity());
        assertEquals(UnitType.CASE, itemCaptor.getValue().getUnitType());
        assertEquals(6, itemCaptor.getValue().getQuantityInBoxes());
        assertEquals(new BigDecimal("300.00"), itemCaptor.getValue().getRate());
        assertEquals(new BigDecimal("600.00"), itemCaptor.getValue().getTotal());

        ArgumentCaptor<StockTransaction> transactionCaptor =
                ArgumentCaptor.forClass(StockTransaction.class);
        verify(stockTransactionRepository).save(transactionCaptor.capture());
        assertEquals(StockTransactionType.SALE, transactionCaptor.getValue().getType());
        assertEquals(new BigDecimal("6"), transactionCaptor.getValue().getQuantity());
        verify(finishedGoodsStockRepository).save(stock);
    }

    @Test
    void createRejectsEmptyInvoiceWithoutPersistingAnything() {
        InvoiceRequestDTO request = invoiceRequest();

        assertThrows(IllegalArgumentException.class, () -> invoiceService.create(request));

        verifyNoInteractions(invoiceRepository, customerRepository, productRepository,
                finishedGoodsStockRepository, invoiceItemRepository, stockTransactionRepository);
    }

    @Test
    void createRejectsSaleWhenFinishedGoodsStockIsInsufficient() {
        FinishedGoodsStock stock = FinishedGoodsStock.builder()
                .product(product)
                .boxQuantity(2)
                .build();
        ProductPrice price = ProductPrice.builder()
                .product(product)
                .customerType(CustomerType.DISTRIBUTOR)
                .pricePerBox(new BigDecimal("100.00"))
                .build();
        InvoiceRequestDTO request = invoiceRequest(itemRequest(3, UnitType.BOX));

        when(invoiceRepository.countByInvoiceNumberStartingWith(anyString())).thenReturn(0L);
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(customerRepository.findById(7)).thenReturn(Optional.of(customer));
        when(productRepository.findById(4)).thenReturn(Optional.of(product));
        when(productPriceRepository.findByProductAndCustomerType(product, CustomerType.DISTRIBUTOR))
                .thenReturn(Optional.of(price));
        when(finishedGoodsStockRepository.findByProduct(product)).thenReturn(Optional.of(stock));

        assertThrows(InsufficientStockException.class, () -> invoiceService.create(request));

        verify(finishedGoodsStockRepository, never()).save(any());
        verify(invoiceItemRepository, never()).save(any());
        verifyNoInteractions(stockTransactionRepository, discountCalculationService);
    }

    @Test
    void addPaymentMarksInvoicePartiallyPaid() {
        Invoice invoice = invoice(BigDecimal.ZERO, InvoiceStatus.CREATED);
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));

        invoiceService.addPayment(1, new BigDecimal("25.00"));

        assertEquals(new BigDecimal("25.00"), invoice.getPaidAmount());
        assertEquals(PaymentStatus.PARTIALLY_PAID, invoice.getPaymentStatus());
        assertEquals(InvoiceStatus.CREATED, invoice.getStatus());
        verify(invoiceRepository).save(invoice);
    }

    @Test
    void addPaymentCompletesInvoiceWhenPaidInFull() {
        Invoice invoice = invoice(BigDecimal.ZERO, InvoiceStatus.CREATED);
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));

        invoiceService.addPayment(1, new BigDecimal("100.00"));

        assertEquals(new BigDecimal("100.00"), invoice.getPaidAmount());
        assertEquals(PaymentStatus.PAID, invoice.getPaymentStatus());
        assertEquals(InvoiceStatus.COMPLETED, invoice.getStatus());
        verify(invoiceRepository).save(invoice);
    }

    @Test
    void addPaymentRejectsAmountAboveBalance() {
        Invoice invoice = invoice(new BigDecimal("25.00"), InvoiceStatus.CREATED);
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));

        assertThrows(IllegalArgumentException.class,
                () -> invoiceService.addPayment(1, new BigDecimal("76.00")));

        assertEquals(new BigDecimal("25.00"), invoice.getPaidAmount());
        verify(invoiceRepository, never()).save(any());
    }

    @Test
    void addPaymentRejectsNullZeroAndNegativeAmountsBeforeLoadingInvoice() {
        assertThrows(IllegalArgumentException.class, () -> invoiceService.addPayment(1, null));
        assertThrows(IllegalArgumentException.class,
                () -> invoiceService.addPayment(1, BigDecimal.ZERO));
        assertThrows(IllegalArgumentException.class,
                () -> invoiceService.addPayment(1, new BigDecimal("-1.00")));

        verifyNoInteractions(invoiceRepository);
    }

    @Test
    void cancelInvoiceRestoresStockAndRecordsRollback() {
        Invoice invoice = invoice(BigDecimal.ZERO, InvoiceStatus.CREATED);
        FinishedGoodsStock stock = FinishedGoodsStock.builder()
                .product(product)
                .boxQuantity(4)
                .build();
        InvoiceItem item = InvoiceItem.builder()
                .invoice(invoice)
                .product(product)
                .quantityInBoxes(3)
                .build();

        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));
        when(invoiceItemRepository.findByInvoice(invoice)).thenReturn(List.of(item));
        when(finishedGoodsStockRepository.findByProduct(product)).thenReturn(Optional.of(stock));

        invoiceService.cancelInvoice(1);

        assertEquals(7, stock.getBoxQuantity());
        assertEquals(InvoiceStatus.CANCELLED, invoice.getStatus());
        verify(finishedGoodsStockRepository).save(stock);
        verify(invoiceRepository).save(invoice);

        ArgumentCaptor<StockTransaction> transactionCaptor =
                ArgumentCaptor.forClass(StockTransaction.class);
        verify(stockTransactionRepository).save(transactionCaptor.capture());
        assertEquals(StockTransactionType.SALE_ROLLBACK, transactionCaptor.getValue().getType());
        assertEquals(new BigDecimal("3"), transactionCaptor.getValue().getQuantity());
    }

    @Test
    void cancelInvoiceRejectsInvoicesWithPaymentsWithoutRestoringStock() {
        Invoice invoice = invoice(new BigDecimal("10.00"), InvoiceStatus.CREATED);
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));

        assertThrows(IllegalStateException.class, () -> invoiceService.cancelInvoice(1));

        verifyNoInteractions(invoiceItemRepository, finishedGoodsStockRepository,
                stockTransactionRepository);
        verify(invoiceRepository, never()).save(any());
    }

    @Test
    void cancelInvoiceRejectsCompletedInvoiceWithoutRestoringStock() {
        Invoice invoice = invoice(BigDecimal.ZERO, InvoiceStatus.COMPLETED);
        when(invoiceRepository.findById(1)).thenReturn(Optional.of(invoice));

        assertThrows(IllegalStateException.class, () -> invoiceService.cancelInvoice(1));

        verifyNoInteractions(invoiceItemRepository, finishedGoodsStockRepository,
                stockTransactionRepository);
        verify(invoiceRepository, never()).save(any());
    }

    private Invoice invoice(BigDecimal paidAmount, InvoiceStatus status) {
        return Invoice.builder()
                .id(1)
                .customer(customer)
                .netAmount(new BigDecimal("100.00"))
                .paidAmount(paidAmount)
                .status(status)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();
    }

    private InvoiceRequestDTO invoiceRequest(InvoiceItemRequestDTO... items) {
        InvoiceRequestDTO request = new InvoiceRequestDTO();
        request.setCustomerId(7);
        request.setItems(List.of(items));
        return request;
    }

    private InvoiceItemRequestDTO itemRequest(int quantity, UnitType unitType) {
        InvoiceItemRequestDTO item = new InvoiceItemRequestDTO();
        item.setProductId(4);
        item.setQuantity(quantity);
        item.setUnitType(unitType);
        return item;
    }
}
