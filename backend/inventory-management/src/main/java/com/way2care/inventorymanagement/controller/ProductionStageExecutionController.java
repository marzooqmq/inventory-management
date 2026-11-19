package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.ProductionStageExecutionRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionStageExecutionResponseDTO;
import com.way2care.inventorymanagement.model.ProductionStage;
import com.way2care.inventorymanagement.service.ProductionStageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/production-executions")
@RequiredArgsConstructor
@Validated
public class ProductionStageExecutionController {

    private final ProductionStageService productionStageService;

    @PostMapping
    public ProductionStageExecutionResponseDTO executeProduction(@Valid @RequestBody ProductionStageExecutionRequestDTO request) {
        return productionStageService.executeProductionStage(request);
    }

    @GetMapping("/order/{orderId}")
    public List<ProductionStageExecutionResponseDTO> getExecutionsByOrderId(@PathVariable Integer orderId) {
        return productionStageService.getExecutionsByOrderId(orderId);
    }

    @PostMapping("/cancel")
    public ResponseEntity<String> cancelProductionExecution(@Valid @RequestParam Integer productionOrderId, @RequestParam ProductionStage stage) {
        productionStageService.cancelProductionStageExecution(productionOrderId, stage);
        return ResponseEntity.ok("Production stage " + stage + " cancelled successfully.");
    }
}
