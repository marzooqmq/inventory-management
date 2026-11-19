package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.DiscountSlabRequestDTO;
import com.way2care.inventorymanagement.dto.DiscountSlabResponseDTO;
import com.way2care.inventorymanagement.service.DiscountSlabService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/discount-slabs")
@RequiredArgsConstructor
@Validated
public class DiscountSlabController {

    private final DiscountSlabService discountSlabService;

    @GetMapping
    public List<DiscountSlabResponseDTO> getAll() {
        return discountSlabService.getAll();
    }

    @GetMapping("/active")
    public List<DiscountSlabResponseDTO> getActive() {
        return discountSlabService.getActive();
    }

    @PostMapping
    public DiscountSlabResponseDTO create(@Valid @RequestBody DiscountSlabRequestDTO request) {
        return discountSlabService.create(request);
    }

    @PutMapping("/{id}")
    public DiscountSlabResponseDTO update(@PathVariable Integer id, @Valid @RequestBody DiscountSlabRequestDTO request) {
        return discountSlabService.update(id, request);
    }

    @PutMapping("/{id}/activate")
    public void activate(@PathVariable Integer id) {
        discountSlabService.activate(id);
    }

    @PutMapping("/{id}/deactivate")
    public void deactivate(@PathVariable Integer id) {
        discountSlabService.deactivate(id);
    }
}
