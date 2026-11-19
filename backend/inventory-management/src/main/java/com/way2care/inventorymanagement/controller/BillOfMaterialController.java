package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.BOMRequestDTO;
import com.way2care.inventorymanagement.dto.BOMResponseDTO;
import com.way2care.inventorymanagement.service.BillOfMaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bom")
@RequiredArgsConstructor
@Validated
public class BillOfMaterialController {

    private final BillOfMaterialService bomService;

    @GetMapping
    public List<BOMResponseDTO> getAll() { return bomService.getAll(); }

    @GetMapping("/{id}")
    public BOMResponseDTO getById(@PathVariable Integer id) { return bomService.getById(id); }

    @PostMapping
    public BOMResponseDTO add(@Valid @RequestBody BOMRequestDTO request) {
        return bomService.create(request);
    }

    @PostMapping("/list")
    public List<BOMResponseDTO> addAll(@Valid @RequestBody List<BOMRequestDTO> request) {
        return bomService.createAll(request);
    }

    @PutMapping("/{id}")
    public BOMResponseDTO update(@PathVariable Integer id, @Valid @RequestBody BOMResponseDTO request) {
        return bomService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        bomService.delete(id);
        return ResponseEntity.ok("Bill of Material deleted successfully");
    }
}
