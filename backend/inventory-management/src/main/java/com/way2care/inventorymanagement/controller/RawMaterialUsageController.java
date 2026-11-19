package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.RawMaterialUsageRequestDTO;
import com.way2care.inventorymanagement.dto.RawMaterialUsageResponseDTO;
import com.way2care.inventorymanagement.service.RawMaterialUsageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/raw-material-usage")
@RequiredArgsConstructor
@Validated
public class RawMaterialUsageController {

    private final RawMaterialUsageService rawMaterialUsageService;

    @GetMapping
    public List<RawMaterialUsageResponseDTO> getAll() { return rawMaterialUsageService.getAll(); }

    @GetMapping("/{id}")
    public RawMaterialUsageResponseDTO getById(@PathVariable Integer id) { return rawMaterialUsageService.getById(id); }

    @PostMapping
    public RawMaterialUsageResponseDTO add(@Valid @RequestBody RawMaterialUsageRequestDTO request) {
        return rawMaterialUsageService.create(request);
    }

    @PutMapping("/{id}")
    public RawMaterialUsageResponseDTO update(@PathVariable Integer id, @RequestBody @Valid RawMaterialUsageRequestDTO request) {
        return rawMaterialUsageService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        rawMaterialUsageService.delete(id);
        return ResponseEntity.ok("Raw Material Usages deleted successfully");
    }
}
