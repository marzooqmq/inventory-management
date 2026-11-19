package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.*;
import com.way2care.inventorymanagement.exception.InsufficientStockException;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.*;
import com.way2care.inventorymanagement.repository.*;
import com.way2care.inventorymanagement.service.DiscountCalculationService;
import com.way2care.inventorymanagement.service.InvoiceService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final FinishedGoodsStockRepository finishedGoodsStockRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final DiscountCalculationService discountCalculationService;
    private final ProductPriceRepository productPriceRepository;
    private final ProductConversionRepository productConversionRepository;

    @Override
    public List<InvoiceResponseDTO> getAll() {
        return invoiceRepository.findAll()
                .stream().map(this::toResponse).toList();
    }

    @Override
    public InvoiceResponseDTO getById(Integer id) {
        return invoiceRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    @Override
    public InvoiceResponseDTO create(InvoiceRequestDTO request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Invoice must have at least one item");
        }

        // .......... 1. FETCH CUSTOMER ..........
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        CustomerType customerType = customer.getType();

        // create invoice entity
        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .customer(customer)
                .status(InvoiceStatus.CREATED)
                .paymentStatus(PaymentStatus.UNPAID)
                .paidAmount(BigDecimal.ZERO)
                .invoiceDate(LocalDateTime.now())
                .build();
        invoice = invoiceRepository.save(invoice);

        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalCostPrice = BigDecimal.ZERO;
        int totalBoxes = 0;

        // .......... 2. PROCESS INVOICE ITEMS ..........
        for(InvoiceItemRequestDTO itemRequest : request.getItems()) {
            if (itemRequest.getQuantity() == null || itemRequest.getQuantity() <= 0) {
                throw new IllegalArgumentException("Item quantity must be greater than zero");
            }

            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            // Get unit type from request (user-selected)
            UnitType unitType = itemRequest.getUnitType();

            // Deduct quantity in boxes
            int quantityInBoxes;
            ProductConversion conversion = null;

            if (unitType == UnitType.CASE) {
                conversion = productConversionRepository.findByProductAndUnitName(product, UnitType.CASE)
                        .orElseThrow(() -> new ResourceNotFoundException("Conversion not found for product: " + product.getName() + " to CASE"));

                quantityInBoxes = itemRequest.getQuantity() * conversion.getBoxesPerUnit();
            } else {
                quantityInBoxes = itemRequest.getQuantity();  // Box
            }

            // Fetch price based on customer type
            ProductPrice productPrice = productPriceRepository.findByProductAndCustomerType(product, customerType)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Price not found for product: " + product.getName() + " and customer type: " + customerType));

            BigDecimal pricePerBox = productPrice.getPricePerBox();

            BigDecimal rate;
            BigDecimal itemTotal;

            if (unitType == UnitType.CASE) {
                rate = pricePerBox.multiply(
                        BigDecimal.valueOf(conversion.getBoxesPerUnit()));
                itemTotal = rate.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            } else {
                rate = pricePerBox;
                itemTotal = rate.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            }

            // .......... 3. Validate & Deduct Stock ..........
            FinishedGoodsStock stock = finishedGoodsStockRepository.findByProduct(product)
                    .orElseThrow(() -> new ResourceNotFoundException("Stock not found for product: " + product.getName()));
            if (stock.getBoxQuantity() < quantityInBoxes) {
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName() +
                        ". Available: " + stock.getBoxQuantity() + ", Requested: " + quantityInBoxes);
            }

            stock.setBoxQuantity(stock.getBoxQuantity() - quantityInBoxes);
            finishedGoodsStockRepository.save(stock);

            // Cost Price Calculation
            BigDecimal itemCost = product.getCostPrice().multiply(BigDecimal.valueOf(quantityInBoxes));

            totalBoxes += quantityInBoxes;
            totalAmount = totalAmount.add(itemTotal);
            totalCostPrice = totalCostPrice.add(itemCost);

            // .......... 4. Save Invoice Item ..........
            invoiceItemRepository.save(
                    InvoiceItem.builder()
                            .invoice(invoice)
                            .product(product)
                            .quantity(itemRequest.getQuantity())
                            .unitType(unitType)
                            .quantityInBoxes(quantityInBoxes)
                            .rate(rate)
                            .total(itemTotal)
                            .build());

            // .......... 5. Record Stock Transaction ..........
            stockTransactionRepository.save(
                    StockTransaction.builder()
                            .type(StockTransactionType.SALE)
                            .itemType(StockItemType.PRODUCT)
                            .itemId(product.getId())
                            .quantity(BigDecimal.valueOf(quantityInBoxes))
                            .module("INVOICE")
                            .moduleId(invoice.getId())
                            .timestamp(LocalDateTime.now())
                            .build());
        }

        // .......... 6. Calculate Discount & Net Amount ..........
        DiscountResponseDTO discountResponse = discountCalculationService.calculateDiscount(totalBoxes, totalAmount, totalCostPrice, LocalDate.now());
        BigDecimal discount = discountResponse.getDiscountAmount();
        BigDecimal netAmount = totalAmount.subtract(discount);

        // .......... 7. Update Invoice with Amounts ..........
        invoice.setTotalAmount(totalAmount);
        invoice.setDiscount(discount);
        invoice.setNetAmount(netAmount);

        Invoice saved = invoiceRepository.save(invoice);
        return toResponse(saved);
    }

    @Override
    public void cancelInvoice(Integer id) {

        // .......... 1. FETCH INVOICE ..........
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        // .......... 2. Prevent Double Cancellation ..........
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new IllegalStateException("Invoice is already cancelled");
        }

        // .......... 3. REAL-WORLD CANCELLATION RULES ..........
        // COMPLETED invoices cannot be cancelled (business transaction completed)
        if (invoice.getStatus() == InvoiceStatus.COMPLETED) {
            throw new IllegalStateException("Completed invoices cannot be cancelled. Please process a refund instead.");
        }

        // Invoices with payments (partial or full) cannot be cancelled directly
        BigDecimal paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO;
        if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalStateException("Cannot cancel invoice with payments. Current paid amount: ₹" + paidAmount + ". Please process a refund first.");
        }

        // Only CREATED invoices with UNPAID status can be cancelled directly

        // .......... 4. Fetch Invoice Items ..........
        List<InvoiceItem> items = invoiceItemRepository.findByInvoice(invoice);
        if (items.isEmpty()) throw new ResourceNotFoundException("No items found for this invoice");

        // .......... 5. Rollback stock for each item ..........
        for (InvoiceItem item : items) {
            Product product = item.getProduct();

            FinishedGoodsStock stock = finishedGoodsStockRepository.findByProduct(product)
                    .orElseThrow(() -> new ResourceNotFoundException("Stock not found for product: " + product.getName()));

            // Restore stock
            stock.setBoxQuantity(stock.getBoxQuantity() + item.getQuantityInBoxes());
            finishedGoodsStockRepository.save(stock);

            // Record stock transaction
            stockTransactionRepository.save(
                    StockTransaction.builder()
                            .type(StockTransactionType.SALE_ROLLBACK)
                            .itemType(StockItemType.PRODUCT)
                            .itemId(product.getId())
                            .quantity(BigDecimal.valueOf(item.getQuantityInBoxes()))
                            .module("INVOICE_CANCEL")
                            .moduleId(invoice.getId())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
        invoice.setStatus(InvoiceStatus.CANCELLED);
        invoiceRepository.save(invoice);
    }

    @Override
    public void addPayment(Integer invoiceId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new IllegalStateException("Cannot add payment to a cancelled invoice");
        }

        BigDecimal netAmount = invoice.getNetAmount();
        BigDecimal paidAmount = invoice.getPaidAmount();
        BigDecimal newPaidAmount = paidAmount.add(amount);

        if (newPaidAmount.compareTo(netAmount) > 0) {
            throw new IllegalArgumentException("Payment exceeds invoice total amount");
        }

        invoice.setPaidAmount(newPaidAmount);

        if (newPaidAmount.compareTo(BigDecimal.ZERO) == 0)
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
        else if (newPaidAmount.compareTo(netAmount) < 0)
            invoice.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
        else {
            invoice.setPaymentStatus(PaymentStatus.PAID);
            // Auto-complete invoice when fully paid (Real-world behavior)
            if (invoice.getStatus() == InvoiceStatus.CREATED) {
                invoice.setStatus(InvoiceStatus.COMPLETED);
            }
        }

        invoiceRepository.save(invoice);
    }

    // === AUTO GENERATE INVOICE NUMBER ===
    private synchronized String generateInvoiceNumber() {
        String month = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        long count = invoiceRepository.countByInvoiceNumberStartingWith("KM" + month) + 1;
        return String.format("KM%s%04d", month, count);
    }

    private InvoiceResponseDTO toResponse(Invoice invoice) {
        List<InvoiceItemResponseDTO> items = invoiceItemRepository.findByInvoice(invoice)
                .stream()
                .map(item -> InvoiceItemResponseDTO.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .unitType(item.getUnitType())
                        .quantityInBoxes(item.getQuantityInBoxes())
                        .rate(item.getRate())
                        .total(item.getTotal())
                        .build())
                .toList();

        return InvoiceResponseDTO.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .customerId(invoice.getCustomer().getId())
                .customerName(invoice.getCustomer().getName())
                .phoneNumber(invoice.getCustomer().getPhone())
                .totalAmount(invoice.getTotalAmount())
                .discount(invoice.getDiscount())
                .netAmount(invoice.getNetAmount())
                .status(invoice.getStatus())
                .paymentStatus(invoice.getPaymentStatus())
                .paidAmount(invoice.getPaidAmount())
                .invoiceDate(invoice.getInvoiceDate())
                .items(items)
                .build();
    }
}