package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.InvoicePaymentDTO;
import com.way2care.inventorymanagement.dto.InvoiceRequestDTO;
import com.way2care.inventorymanagement.dto.InvoiceResponseDTO;
import com.way2care.inventorymanagement.service.InvoicePdfService;
import com.way2care.inventorymanagement.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
@Validated
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final InvoicePdfService invoicePdfService;

    @GetMapping
    public List<InvoiceResponseDTO> getAll() { return invoiceService.getAll(); }

    @GetMapping("/{id}")
    public InvoiceResponseDTO getById(@PathVariable Integer id) { return invoiceService.getById(id); }

    @GetMapping("/pdf/{id}")
    public ResponseEntity<InputStreamResource> getInvoicePdf(@PathVariable Integer id) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + invoicePdfService.generateInvoicePdf(id).getKey() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(invoicePdfService.generateInvoicePdf(id).getValue());
    }

    @PostMapping
    public InvoiceResponseDTO create(@Valid @RequestBody InvoiceRequestDTO request) {
        return invoiceService.create(request);
    }

    @PutMapping("/cancel/{id}")
    public ResponseEntity<String> cancel(@PathVariable Integer id) {
        invoiceService.cancelInvoice(id);
        return ResponseEntity.ok("Invoice cancelled successfully");
    }

    @PutMapping("/payment/{invoiceId}")
    public ResponseEntity<String> addPayment(@PathVariable Integer invoiceId, @RequestBody InvoicePaymentDTO request) {
        invoiceService.addPayment(invoiceId, request.getPaidAmount());
        return ResponseEntity.ok("Payment added successfully");
    }
}
