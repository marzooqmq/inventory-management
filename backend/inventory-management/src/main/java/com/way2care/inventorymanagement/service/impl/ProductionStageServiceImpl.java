package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.ProductionStageExecutionRequestDTO;
import com.way2care.inventorymanagement.dto.ProductionStageExecutionResponseDTO;
import com.way2care.inventorymanagement.exception.InsufficientStockException;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.*;
import com.way2care.inventorymanagement.repository.*;
import com.way2care.inventorymanagement.service.ProductionStageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductionStageServiceImpl implements ProductionStageService {

    private final ProductionOrderRepository productionOrderRepository;
    private final ProductionRepository productionRepository;
    private final ProductionStageExecutionRepository productionStageExecutionRepository;
    private final BillOfMaterialRepository bomRepository;
    private final RawMaterialStockRepository rawMaterialStockRepository;
    private final RawMaterialUsageRepository rawMaterialUsageRepository;
    private final FinishedGoodsStockRepository finishedGoodsStockRepository;
    private final BoxRepository boxRepository;
    private final BoxStockRepository boxStockRepository;
    private final StockTransactionRepository stockTransactionRepository;

    /* ============================================================
       EXECUTE PRODUCTION STAGE
       ============================================================ */
    @Override
    public ProductionStageExecutionResponseDTO executeProductionStage(ProductionStageExecutionRequestDTO request) {

        ProductionOrder order = productionOrderRepository.findById(request.getProductionOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Production Order not found"));

        validateProcessQty(request);
        validateStageExecution(order, request.getStage());

        ProductionStageExecution execution = switch (request.getStage()) {
            case SEALING -> executeSealing(order);
            case FINAL_CUTTING, FOLDING -> executeIntermediateStage(order, request.getStage(), request.getProcessQty());
            case PACKING -> executePacking(order, request.getProcessQty());
        };

        updateProductionOrderStatus(order);
        return toResponse(execution);
    }

    /* ============================================================
       CANCEL PRODUCTION STAGE
       ============================================================ */
    @Override
    public void cancelProductionStageExecution(Integer productionOrderId, ProductionStage stage) {
        ProductionOrder order = productionOrderRepository.findById(productionOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Production Order not found"));

        ProductionStageExecution execution = productionStageExecutionRepository
                .findFirstByProductionOrderAndStageOrderByExecutedAtDesc(order, stage)
                .orElseThrow(() -> new ResourceNotFoundException("Production Stage Execution not found for stage: " + stage));

        validateStageCancellation(order, stage);

        switch (stage) {
            case SEALING -> rollbackSealing(order);
            case PACKING -> rollbackPacking(execution);
        }

        productionStageExecutionRepository.delete(execution);

        updateProductionOrderStatus(order);
        productionOrderRepository.save(order);
    }

    // Validation
    private void validateStageExecution(ProductionOrder order, ProductionStage stage) {
        if (stage == ProductionStage.SEALING) {
            boolean alreadyExecuted = productionStageExecutionRepository
                    .existsByProductionOrderAndStageAndStatus(order, ProductionStage.SEALING, ProductionStageStatus.COMPLETED);
            if (alreadyExecuted) {
                throw new IllegalStateException("Sealing stage already executed for order ID: " + order.getId());
            }
        }
        if (stage != ProductionStage.SEALING) {
            ProductionStage previousStage = getPreviousStage(stage);
            Integer completedQty = productionStageExecutionRepository
                    .sumOutputQtyByProductionOrderAndStage(order.getId(), previousStage.name());
            if (completedQty == null || completedQty <= 0) {
                throw new IllegalStateException("Previous stage " + previousStage + " not completed for order ID: " + order.getId());
            }
        }
    }

    private void validateProcessQty(ProductionStageExecutionRequestDTO request) {
        if (request.getStage() != ProductionStage.SEALING) {
            if (request.getProcessQty() == null) {
                throw new IllegalArgumentException(
                        "processQty is required for stage: " + request.getStage()
                );
            }
            if (request.getProcessQty() <= 0) {
                throw new IllegalArgumentException(
                        "processQty must be greater than zero"
                );
            }
        }
    }

    private void validateStageCancellation(ProductionOrder order, ProductionStage stage) {
        ProductionStage nextStage = switch (stage) {
            case SEALING -> ProductionStage.FINAL_CUTTING;
            case FINAL_CUTTING -> ProductionStage.FOLDING;
            case FOLDING -> ProductionStage.PACKING;
            case PACKING -> null;
        };

        if (nextStage != null && productionStageExecutionRepository.existsByProductionOrderAndStageAndStatus(
                order, nextStage, ProductionStageStatus.COMPLETED)) {
            throw new IllegalStateException("Cannot cancel stage " + stage +
                    " as next stage " + nextStage + " is already completed.");
        }
    }

    /* =====================================================
                               SEALING
       ===================================================== */
    private ProductionStageExecution executeSealing(ProductionOrder order) {
        if (productionStageExecutionRepository.existsByProductionOrderAndStageAndStatus(
                order, ProductionStage.SEALING, ProductionStageStatus.COMPLETED)) {
            throw new IllegalStateException("Sealing stage already executed for order ID: " + order.getId());
        }

        /* ------------------ RAW MATERIAL CONSUMPTION ------------------ */
        List<BillOfMaterial> bomList = bomRepository.findByProduct(order.getProduct());
        if(bomList.isEmpty()) throw new ResourceNotFoundException("BOM not defined for product: " + order.getProduct().getName());

        //  Validate & deduct raw materials
        for (BillOfMaterial bom : bomList) {
            RawMaterial material = bom.getMaterial();
            BigDecimal requiredQty =  bom.getQtyRequired()
                    .multiply(BigDecimal.valueOf(order.getQuantity()))
                    .divide(material.getConversionFactor(), 6, RoundingMode.HALF_UP);  // (req qty * qty produced) / conversion factor

            RawMaterialStock stock = rawMaterialStockRepository.findByMaterial(material)
                    .orElseThrow(() -> new ResourceNotFoundException("Raw Material Stock not found for material: " + material.getName()));

            if (stock.getQuantity().compareTo(requiredQty) < 0) {
                throw new InsufficientStockException("Insufficient stock for material: " + material.getName() +
                        " (Available: " + stock.getQuantity() + ", Required: " + requiredQty + ")");
            }

            // Deduct stock
            stock.setQuantity(stock.getQuantity().subtract(requiredQty));
            rawMaterialStockRepository.save(stock);

            // save RawMaterial usage record
            rawMaterialUsageRepository.save(
                    RawMaterialUsage.builder()
                            .productionOrder(order)
                            .material(material)
                            .qtyUsed(requiredQty)
                            .wastage(BigDecimal.ZERO)
                            .build());

            // save stock transaction for raw material consumption
            stockTransactionRepository.save(
                    StockTransaction.builder()
                            .type(StockTransactionType.PRODUCTION_CONSUMPTION)
                            .itemType(StockItemType.RAW_MATERIAL)
                            .itemId(material.getId())
                            .quantity(requiredQty.negate())
                            .module("PRODUCTION")
                            .moduleId(order.getId())
                            .timestamp(java.time.LocalDateTime.now())
                            .build());
        }

        return productionStageExecutionRepository.save(
                ProductionStageExecution.builder()
                        .productionOrder(order)
                        .stage(ProductionStage.SEALING)
                        .inputQty(order.getQuantity())
                        .outputQty(order.getQuantity())
                        .balanceQty(0)
                        .status(ProductionStageStatus.COMPLETED)
                        .build());
    }

    // Rollback Sealing
    private void rollbackSealing(ProductionOrder order) {
        /* -------- RAW MATERIAL ROLLBACK -------- */
        List<RawMaterialUsage> usages = rawMaterialUsageRepository.findByProductionOrder(order);

        for (RawMaterialUsage usage : usages) {
            RawMaterialStock stock = rawMaterialStockRepository.findByMaterial(usage.getMaterial())
                    .orElseThrow(() -> new ResourceNotFoundException("Raw Material Stock not found for material: " + usage.getMaterial().getName()));

            stock.setQuantity(stock.getQuantity().add(usage.getQtyUsed()));
            rawMaterialStockRepository.save(stock);

            // save stock transaction for raw material rollback
            stockTransactionRepository.save(
                    StockTransaction.builder()
                            .type(StockTransactionType.PRODUCTION_ROLLBACK)
                            .itemType(StockItemType.RAW_MATERIAL)
                            .itemId(usage.getMaterial().getId())
                            .quantity(usage.getQtyUsed())
                            .module("PRODUCTION_CANCEL")
                            .moduleId(order.getId())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
        rawMaterialUsageRepository.deleteAll(usages);
    }

    /* =====================================================
       FINAL CUTTING & FOLDING (PARTIAL MOVEMENT CONTINUATION)
       ===================================================== */
    private ProductionStageExecution executeIntermediateStage(
            ProductionOrder order, ProductionStage stage, Integer processQty) {

        ProductionStage previousStage = getPreviousStage(stage);

        Integer previouslyCompletedQty = productionStageExecutionRepository
                .sumOutputQtyByProductionOrderAndStage(order.getId(), previousStage.name());

        Integer currentlyProcessedQty = productionStageExecutionRepository
                .sumOutputQtyByProductionOrderAndStage(order.getId(), stage.name());

        Integer remainingQty = previouslyCompletedQty - currentlyProcessedQty;

        if (processQty <= 0 || processQty > remainingQty) {
            throw new InsufficientStockException("Insufficient quantity from previous stage. Available: " +
                    remainingQty + ", Requested: " + processQty);
        }

        return productionStageExecutionRepository.save(
                ProductionStageExecution.builder()
                        .productionOrder(order)
                        .stage(stage)
                        .inputQty(remainingQty)
                        .outputQty(processQty)
                        .balanceQty(remainingQty - processQty)
                        .status(processQty.equals(remainingQty) ?
                                ProductionStageStatus.COMPLETED :
                                ProductionStageStatus.PENDING
                        )
                        .build());
    }

    /* =====================================================
                           PACKING
       ===================================================== */
    private ProductionStageExecution executePacking(ProductionOrder order, Integer processQty) {

        Integer completedQty = productionStageExecutionRepository
                .sumOutputQtyByProductionOrderAndStage(order.getId(), ProductionStage.FOLDING.name());

        Integer currentlyProcessedQty = productionStageExecutionRepository
                .sumOutputQtyByProductionOrderAndStage(order.getId(), ProductionStage.PACKING.name());

        Integer remainingQty = completedQty - currentlyProcessedQty;

        if (processQty <= 0 || processQty > remainingQty) {
            throw new InsufficientStockException("Insufficient quantity from previous stage. Available: " +
                    remainingQty + ", Requested: " + processQty);
        }

        Product product = order.getProduct();
        Integer padsPerBox = product.getPadsPerBox();

        Integer boxes = processQty / padsPerBox;           // full boxes to be packed
        Integer remainingPads = processQty % padsPerBox;  // loose pads

        /* ------------------ BOX STOCK DEDUCTION ------------------ */
        Box box = boxRepository.findByProduct(product)
                .orElseThrow(() -> new ResourceNotFoundException("Box not defined for product: " + product.getName()));
        BoxStock boxStock = boxStockRepository.findByBox(box)
                .orElseThrow(() -> new ResourceNotFoundException("Box Stock not found for box: " + box.getProduct().getName()));

        if(boxStock.getQuantity() < boxes) {
            throw new InsufficientStockException("Insufficient box stock for product: " + product.getName() +
                    " (Available: " + boxStock.getQuantity() + ", Required: " + boxes + ")");
        }

        boxStock.setQuantity(boxStock.getQuantity() - boxes);
        boxStockRepository.save(boxStock);

        // save stock transaction for box consumption
        stockTransactionRepository.save(
                StockTransaction.builder()
                        .type(StockTransactionType.PRODUCTION_CONSUMPTION)
                        .itemType(StockItemType.BOX)
                        .itemId(box.getId())
                        .quantity(BigDecimal.valueOf(boxes).negate())
                        .module("PRODUCTION")
                        .moduleId(order.getId())
                        .timestamp(java.time.LocalDateTime.now())
                        .build());

        /* ------------------ FINISHED GOODS STOCK UPDATE ------------------ */
        FinishedGoodsStock finishedStock = finishedGoodsStockRepository.findByProduct(product)
                .orElse(FinishedGoodsStock.builder()
                        .product(product)
                        .boxQuantity(0)
                        .loosePads(0)
                        .build());

        finishedStock.setBoxQuantity(finishedStock.getBoxQuantity() + boxes);
        finishedStock.setLoosePads(finishedStock.getLoosePads() + remainingPads);

        // Convert loose pads into boxes if possible
        Integer loosePadsToBoxes = finishedStock.getLoosePads() / padsPerBox;
        finishedStock.setBoxQuantity(finishedStock.getBoxQuantity() + loosePadsToBoxes);
        finishedStock.setLoosePads(finishedStock.getLoosePads() % padsPerBox);

        finishedGoodsStockRepository.save(finishedStock);

        // save stock transaction for finished goods addition
        stockTransactionRepository.save(
                StockTransaction.builder()
                        .type(StockTransactionType.PRODUCTION_OUTPUT)
                        .itemType(StockItemType.PRODUCT)
                        .itemId(product.getId())
                        .quantity(BigDecimal.valueOf(boxes))
                        .module("PRODUCTION")
                        .moduleId(order.getId())
                        .timestamp(java.time.LocalDateTime.now())
                        .build());

        // save production log
        productionRepository.save(
                Production.builder()
                        .productionOrder(order)
                        .product(product)
                        .quantityProduced(boxes)
                        .timestamp(LocalDateTime.now())
                        .build()
        );

        return productionStageExecutionRepository.save(
                ProductionStageExecution.builder()
                        .productionOrder(order)
                        .stage(ProductionStage.PACKING)
                        .inputQty(remainingQty)
                        .outputQty(processQty)
                        .balanceQty(remainingQty - processQty)
                        .status(processQty.equals(remainingQty) ?
                                ProductionStageStatus.COMPLETED :
                                ProductionStageStatus.PENDING)
                        .build());
    }

    // Rollback Packing
    private void rollbackPacking(ProductionStageExecution execution) {
        Product product = execution.getProductionOrder().getProduct();
        Integer pads = execution.getOutputQty();
        Integer padsPerBox = product.getPadsPerBox();

        Integer boxes = pads / padsPerBox ;          // full boxes to be rolled back
        Integer loosePads = pads % padsPerBox;  // loose pads

        /* ------------------ BOX STOCK ROLLBACK ------------------ */
        Box box = boxRepository.findByProduct(product)
                .orElseThrow(() -> new ResourceNotFoundException("Box not defined for product: " + product.getName()));
        BoxStock boxStock = boxStockRepository.findByBox(box)
                .orElseThrow(() -> new ResourceNotFoundException("Box Stock not found for box: " + box.getProduct().getName()));

        boxStock.setQuantity(boxStock.getQuantity() + boxes);
        boxStockRepository.save(boxStock);

        //save stock transaction for box rollback
        stockTransactionRepository.save(
                StockTransaction.builder()
                        .type(StockTransactionType.PRODUCTION_ROLLBACK)
                        .itemType(StockItemType.BOX)
                        .itemId(box.getId())
                        .quantity(BigDecimal.valueOf(boxes))
                        .module("PRODUCTION_CANCEL")
                        .moduleId(execution.getId())
                        .timestamp(LocalDateTime.now())
                        .build());

        /* -------- FINISHED GOODS ROLLBACK -------- */
        FinishedGoodsStock finishedStock = finishedGoodsStockRepository.findByProduct(product)
                .orElseThrow(() -> new ResourceNotFoundException("Finished Goods Stock not found for product: " + product.getName()));

        if(finishedStock.getBoxQuantity() < boxes) {
            throw new InsufficientStockException("Insufficient finished goods stock to rollback for product: " + product.getName());
        }

        finishedStock.setBoxQuantity(finishedStock.getBoxQuantity() - boxes);
        finishedStock.setLoosePads(Math.max(0, finishedStock.getLoosePads() - loosePads));

        finishedGoodsStockRepository.save(finishedStock);

        productionRepository.deleteAll(productionRepository.findByProductionOrder(execution.getProductionOrder()));

        // save stock transaction for finished goods rollback
        stockTransactionRepository.save(
                StockTransaction.builder()
                        .type(StockTransactionType.PRODUCTION_ROLLBACK)
                        .itemType(StockItemType.PRODUCT)
                        .itemId(product.getId())
                        .quantity(BigDecimal.valueOf(boxes))
                        .module("PRODUCTION_CANCEL")
                        .moduleId(execution.getId())
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @Override
    public List<ProductionStageExecutionResponseDTO> getExecutionsByOrderId(Integer orderId) {
        List<ProductionStageExecution> executions = productionStageExecutionRepository.findByProductionOrderId(orderId);
        return executions.stream()
                .map(this::toResponse)
                .toList();
    }

    // HELPER METHODS

    private ProductionStage getPreviousStage(ProductionStage stage) {
        return switch (stage) {
            case FINAL_CUTTING -> ProductionStage.SEALING;
            case FOLDING -> ProductionStage.FINAL_CUTTING;
            case PACKING -> ProductionStage.FOLDING;
            default -> throw new IllegalArgumentException("No previous stage for: " + stage);
        };
    }

    private void updateProductionOrderStatus(ProductionOrder order) {
       Integer packingQty = productionStageExecutionRepository
                .sumOutputQtyByProductionOrderAndStage(order.getId(), ProductionStage.PACKING.name());
       Integer foldingQty = productionStageExecutionRepository
                .sumOutputQtyByProductionOrderAndStage(order.getId(), ProductionStage.FOLDING.name());
       Integer finalCuttingQty = productionStageExecutionRepository
                .sumOutputQtyByProductionOrderAndStage(order.getId(), ProductionStage.FINAL_CUTTING.name());
       Integer sealingQty = productionStageExecutionRepository
               .sumOutputQtyByProductionOrderAndStage(order.getId(), ProductionStage.SEALING.name());

       if (packingQty != null && packingQty > 0 &&  packingQty.equals(order.getQuantity())) {
           order.setStatus(ProductionOrderStatus.COMPLETED);
           // Set end date based on max executedAt from packing stage
           Optional<LocalDateTime> maxPackingDate = productionStageExecutionRepository
                   .findMaxExecutedAtByProductionOrderIdAndPackingStage(order.getId());
           maxPackingDate.ifPresent(dateTime -> order.setEndDate(dateTime.toLocalDate()));
       } else if (packingQty != null && packingQty > 0) {
           order.setStatus(ProductionOrderStatus.PACKING_IN_PROGRESS);
       } else if (foldingQty != null && foldingQty > 0) {
           order.setStatus(ProductionOrderStatus.FOLDING_IN_PROGRESS);
       } else if (finalCuttingQty != null && finalCuttingQty > 0) {
           order.setStatus(ProductionOrderStatus.FINAL_CUTTING_IN_PROGRESS);
       } else if (sealingQty != null && sealingQty > 0) {
           order.setStatus(ProductionOrderStatus.SEALING_IN_PROGRESS);
       } else {
           order.setStatus(ProductionOrderStatus.CREATED);
       }

        productionOrderRepository.save(order);
    }

    /* ---------------- Object Mapper to response ---------------- */
    private ProductionStageExecutionResponseDTO toResponse(ProductionStageExecution stage) {
        return ProductionStageExecutionResponseDTO.builder()
                .id(stage.getId())
                .productionOrderId(stage.getProductionOrder().getId())
                .stage(stage.getStage())
                .inputQty(stage.getInputQty())
                .outputQty(stage.getOutputQty())
                .balanceQty(stage.getBalanceQty())
                .status(stage.getStatus())
                .executedAt(stage.getExecutedAt())
                .build();
    }
}
