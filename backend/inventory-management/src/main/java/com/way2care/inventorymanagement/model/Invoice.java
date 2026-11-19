package com.way2care.inventorymanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true)
    private String invoiceNumber;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    private BigDecimal totalAmount;
    private BigDecimal discount;
    private BigDecimal netAmount;

    private LocalDateTime invoiceDate;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status; // CREATED / CANCELLED

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus; // PAID / UNPAID / PARTIALLY_PAID

    private BigDecimal paidAmount;

    @PrePersist
    protected void onCreate() {
        invoiceDate = LocalDateTime.now();

        if (status == null)
            status = InvoiceStatus.CREATED;

        if (paymentStatus == null)
            paymentStatus = PaymentStatus.UNPAID;

        if (paidAmount == null)
            paidAmount = BigDecimal.ZERO;
    }
}
