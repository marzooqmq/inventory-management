package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.RawMaterialRequestDTO;
import com.way2care.inventorymanagement.dto.RawMaterialResponseDTO;
import com.way2care.inventorymanagement.service.RawMaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/raw-materials")
@RequiredArgsConstructor
@Validated
public class RawMaterialController {

    private final RawMaterialService rawMaterialService;

    @GetMapping
    public List<RawMaterialResponseDTO> getAll() { return rawMaterialService.getAll(); }

    @GetMapping("/{id}")
    public RawMaterialResponseDTO getById(@PathVariable Integer id) { return rawMaterialService.getById(id); }

    @PostMapping
    public RawMaterialResponseDTO add(@RequestBody @Valid RawMaterialRequestDTO request) {
        return rawMaterialService.create(request);
    }

    @PutMapping("/{id}")
    public RawMaterialResponseDTO update(@PathVariable Integer id, @RequestBody @Valid RawMaterialRequestDTO request) {
        return rawMaterialService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        rawMaterialService.delete(id);
        return ResponseEntity.ok("Raw Material deleted successfully");
    }
}
