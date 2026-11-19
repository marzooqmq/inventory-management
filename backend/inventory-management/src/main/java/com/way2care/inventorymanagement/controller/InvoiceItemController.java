package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.InvoiceItemResponseDTO;
import com.way2care.inventorymanagement.service.InvoiceItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invoice-items")
@RequiredArgsConstructor
@Validated
public class InvoiceItemController {

    private final InvoiceItemService invoiceItemService;

    @GetMapping
    public List<InvoiceItemResponseDTO> getAll() {
        return invoiceItemService.getAll();
    }

    @GetMapping("/{id}")
    public InvoiceItemResponseDTO getById(@PathVariable Integer id) {
        return invoiceItemService.getById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        invoiceItemService.delete(id);
        return ResponseEntity.ok("Invoice Item deleted successfully");
    }
}
