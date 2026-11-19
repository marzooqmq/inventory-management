package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.BoxRequestDTO;
import com.way2care.inventorymanagement.dto.BoxResponseDTO;
import com.way2care.inventorymanagement.service.BoxService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/boxes")
@RequiredArgsConstructor
@Validated
public class BoxController {

    private final BoxService boxService;

    @GetMapping
    public List<BoxResponseDTO> getAll() {
        return boxService.getAll();
    }

    @GetMapping("/{id}")
    public BoxResponseDTO getById(@PathVariable Integer id) {
        return boxService.getById(id);
    }

    @PostMapping
    public BoxResponseDTO add(@Valid @RequestBody BoxRequestDTO request) {
        return boxService.create(request);
    }

    @PutMapping("/{id}")
    public BoxResponseDTO update(@PathVariable Integer id, @Valid @RequestBody BoxRequestDTO request) {
        return boxService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        boxService.delete(id);
        return ResponseEntity.ok("Box deleted successfully");
    }
}
