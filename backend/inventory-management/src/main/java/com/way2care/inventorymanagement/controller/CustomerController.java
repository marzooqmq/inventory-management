package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.CustomerRequestDTO;
import com.way2care.inventorymanagement.dto.CustomerResponseDTO;
import com.way2care.inventorymanagement.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
@Validated
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public List<CustomerResponseDTO> getAll(){ return customerService.getAll(); }

    @GetMapping("/search")
    public List<CustomerResponseDTO> search(@RequestParam(required = false) String query) {
        return customerService.search(query);
    }

    @GetMapping("/{id}")
    public CustomerResponseDTO getById(@PathVariable Integer id){ return customerService.getById(id); }

    @PostMapping
    public CustomerResponseDTO add(@Valid @RequestBody CustomerRequestDTO request) {
        return customerService.create(request);
    }

    @PutMapping("/{id}")
    public CustomerResponseDTO update(@PathVariable Integer id, @Valid @RequestBody CustomerRequestDTO request) {
        return customerService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        customerService.delete(id);
        return ResponseEntity.ok("Customer deleted successfully");
    }
}
