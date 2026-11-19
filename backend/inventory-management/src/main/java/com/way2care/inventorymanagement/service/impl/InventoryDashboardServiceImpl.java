package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.dashboard.*;
import com.way2care.inventorymanagement.model.*;
import com.way2care.inventorymanagement.repository.*;
import com.way2care.inventorymanagement.service.InventoryDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InventoryDashboardServiceImpl implements InventoryDashboardService {

    private final ProductRepository productRepository;
    private final RawMaterialStockRepository rawMaterialStockRepository;
    private final FinishedGoodsStockRepository finishedGoodsStockRepository;
    private final BoxStockRepository boxStockRepository;
    private final ProductionOrderRepository productionOrderRepository;
    private final ProductionRepository productionRepository;
    private final InvoiceRepository invoiceRepository;
    private final ProductPriceRepository productPriceRepository;
    private final RawMaterialUsageRepository rawMaterialUsageRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final BoxRepository boxRepository;

    @Override
    @Cacheable(value = "dashboardSummary", unless = "#result == null")
    public DashboardSummaryDTO getSummary() {
        log.debug("Fetching dashboard summary");
        
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime todayEnd = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        // Total products count
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByActive(true);

        // Total stock value calculation
        BigDecimal totalStockValue = calculateTotalStockValue();

        // Low stock items count
        long lowStockCount = countLowStockItems();

        // Active production orders
        long activeOrders = productionOrderRepository.countByStatusNotIn(
                List.of(ProductionOrderStatus.COMPLETED, ProductionOrderStatus.CANCELLED)
        );

        // Pending invoices
        long pendingInvoices = invoiceRepository.countByPaymentStatusIn(
                List.of(PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID)
        );

        // Today's sales
        List<Invoice> todayInvoices = invoiceRepository.findByInvoiceDateBetweenAndStatus(
                todayStart, todayEnd, InvoiceStatus.CREATED
        );
        
        BigDecimal todaySales = todayInvoices.stream()
                .map(Invoice::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardSummaryDTO.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .totalStockValue(totalStockValue)
                .lowStockItemsCount(lowStockCount)
                .activeProductionOrders(activeOrders)
                .pendingInvoices(pendingInvoices)
                .todaySalesValue(todaySales)
                .todaySalesCount((long) todayInvoices.size())
                .build();
    }

    @Override
    public StockBreakdownDTO getStockBreakdown() {
        log.debug("Fetching stock breakdown");

        // Raw material stock
        List<RawMaterialStock> rawMaterialStocks = rawMaterialStockRepository.findAll();
        BigDecimal rawMaterialValue = rawMaterialStocks.stream()
                .map(stock -> stock.getQuantity().multiply(
                        stock.getMaterial().getUnitPrice() != null ? 
                        stock.getMaterial().getUnitPrice() : BigDecimal.ZERO
                ))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Finished goods stock
        List<FinishedGoodsStock> finishedGoodsStocks = finishedGoodsStockRepository.findAll();
        BigDecimal finishedGoodsValue = finishedGoodsStocks.stream()
                .map(stock -> {
                    Product product = stock.getProduct();
                    BigDecimal costPerBox = getProductCostPrice(product);
                    BigDecimal costPerPad = product.getPadsPerBox() != null && product.getPadsPerBox() > 0 ?
                            costPerBox.divide(BigDecimal.valueOf(product.getPadsPerBox()), 2, BigDecimal.ROUND_HALF_UP) :
                            BigDecimal.ZERO;

                    // Value from complete boxes
                    BigDecimal boxValue = costPerBox.multiply(BigDecimal.valueOf(stock.getBoxQuantity()));

                    // Value from loose pads
                    BigDecimal loosePadValue = costPerPad.multiply(BigDecimal.valueOf(stock.getLoosePads()));

                    return boxValue.add(loosePadValue);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Box stock
        List<BoxStock> boxStocks = boxStockRepository.findAll();
        BigDecimal boxValue = boxStocks.stream()
                .map(stock -> BigDecimal.valueOf(stock.getQuantity())
                        .multiply(stock.getBox().getUnitPrice() != null ? 
                                stock.getBox().getUnitPrice() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return StockBreakdownDTO.builder()
                .rawMaterialStockValue(rawMaterialValue)
                .rawMaterialStockCount((long) rawMaterialStocks.size())
                .finishedGoodsStockValue(finishedGoodsValue)
                .finishedGoodsStockCount((long) finishedGoodsStocks.size())
                .boxStockValue(boxValue)
                .boxStockCount((long) boxStocks.size())
                .build();
    }

    @Override
    public List<ProductionDailyDTO> getProductionDaily(LocalDate date) {
        log.debug("Fetching daily production for date: {}", date);
        
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Production> productions = productionRepository.findByTimestampBetween(startOfDay, endOfDay);

        Map<Product, Long> productionByProduct = productions.stream()
                .collect(Collectors.groupingBy(
                        Production::getProduct,
                        Collectors.summingLong(Production::getQuantityProduced)
                ));

        return productionByProduct.entrySet().stream()
                .map(entry -> ProductionDailyDTO.builder()
                        .productId(entry.getKey().getId())
                        .productName(entry.getKey().getName())
                        .productCategory(entry.getKey().getCategory().name())
                        .quantityProduced(entry.getValue())
                        .productionDate(date)
                        .build())
                .sorted(Comparator.comparing(ProductionDailyDTO::getQuantityProduced).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public ProductionStageCountDTO getProductionStageCount() {
        log.debug("Fetching production stage counts");

        long sealing = productionOrderRepository.countByStatus(ProductionOrderStatus.SEALING_IN_PROGRESS);
        long finalCutting = productionOrderRepository.countByStatus(ProductionOrderStatus.FINAL_CUTTING_IN_PROGRESS);
        long folding = productionOrderRepository.countByStatus(ProductionOrderStatus.FOLDING_IN_PROGRESS);
        long packing = productionOrderRepository.countByStatus(ProductionOrderStatus.PACKING_IN_PROGRESS);
        long completed = productionOrderRepository.countByStatus(ProductionOrderStatus.COMPLETED);

        return ProductionStageCountDTO.builder()
                .sealingCount(sealing)
                .finalCuttingCount(finalCutting)
                .foldingCount(folding)
                .packingCount(packing)
                .completedCount(completed)
                .totalActive(sealing + finalCutting + folding + packing)
                .build();
    }

    @Override
    public List<LowStockItemDTO> getLowStockItems() {
        log.debug("Fetching low stock items");
        
        List<LowStockItemDTO> lowStockItems = new ArrayList<>();

        // Raw materials
        rawMaterialStockRepository.findAll().stream()
                .filter(stock -> stock.getMinStockLevel() != null && 
                        stock.getQuantity().compareTo(stock.getMinStockLevel()) < 0)
                .forEach(stock -> {
                    BigDecimal deficit = stock.getMinStockLevel().subtract(stock.getQuantity());
                    String severity = calculateSeverity(stock.getQuantity(), stock.getMinStockLevel());
                    
                    lowStockItems.add(LowStockItemDTO.builder()
                            .itemType("RAW_MATERIAL")
                            .itemId(stock.getMaterial().getId())
                            .itemName(stock.getMaterial().getName())
                            .currentQuantity(stock.getQuantity())
                            .minStockLevel(stock.getMinStockLevel())
                            .stockDeficit(deficit)
                            .severity(severity)
                            .build());
                });

        // Box stock
        boxStockRepository.findAll().stream()
                .filter(stock -> stock.getMinStockLevel() != null && 
                        stock.getQuantity() < stock.getMinStockLevel())
                .forEach(stock -> {
                    BigDecimal deficit = BigDecimal.valueOf(stock.getMinStockLevel() - stock.getQuantity());
                    String severity = calculateSeverity(
                            BigDecimal.valueOf(stock.getQuantity()), 
                            BigDecimal.valueOf(stock.getMinStockLevel())
                    );
                    
                    lowStockItems.add(LowStockItemDTO.builder()
                            .itemType("BOX")
                            .itemId(stock.getBox().getId())
                            .itemName(stock.getBox().getName())
                            .currentQuantity(BigDecimal.valueOf(stock.getQuantity()))
                            .minStockLevel(BigDecimal.valueOf(stock.getMinStockLevel()))
                            .stockDeficit(deficit)
                            .severity(severity)
                            .build());
                });

        return lowStockItems.stream()
                .sorted(Comparator.comparing(LowStockItemDTO::getSeverity)
                        .thenComparing(LowStockItemDTO::getStockDeficit).reversed())
                .collect(Collectors.toList());
    }

    private Map<Integer, BigDecimal> calculateMaterialDailyConsumption() {
        // Get usage data from last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<RawMaterialUsage> usageRecords = rawMaterialUsageRepository.findAll().stream()
                .filter(usage -> usage.getTimestamp().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());

        // Group by material and calculate average daily consumption
        Map<Integer, List<RawMaterialUsage>> usageByMaterial = usageRecords.stream()
                .collect(Collectors.groupingBy(usage -> usage.getMaterial().getId()));

        Map<Integer, BigDecimal> dailyConsumptionMap = new HashMap<>();
        
        for (Map.Entry<Integer, List<RawMaterialUsage>> entry : usageByMaterial.entrySet()) {
            List<RawMaterialUsage> materialUsages = entry.getValue();
            
            // Calculate total usage
            BigDecimal totalUsage = materialUsages.stream()
                    .map(RawMaterialUsage::getQtyUsed)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calculate number of days with data
            long daysWithData = materialUsages.stream()
                    .map(usage -> usage.getTimestamp().toLocalDate())
                    .distinct()
                    .count();
            
            if (daysWithData == 0) daysWithData = 1;
            
            // Calculate daily average
            BigDecimal dailyConsumption = totalUsage.divide(
                    BigDecimal.valueOf(daysWithData), 2, BigDecimal.ROUND_HALF_UP);
            
            dailyConsumptionMap.put(entry.getKey(), dailyConsumption);
        }
        
        return dailyConsumptionMap;
    }

    private Map<Integer, BigDecimal> calculateBoxDailyConsumption() {
        // Get all boxes with their products
        List<Box> allBoxes = boxRepository.findAll();
        Map<Integer, Box> productIdToBox = allBoxes.stream()
                .filter(box -> box.getProduct() != null)
                .collect(Collectors.toMap(
                        box -> box.getProduct().getId(),
                        box -> box,
                        (existing, replacement) -> existing
                ));

        // Get production data from last 30 days to calculate box consumption
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Production> productionRecords = productionRepository.findAll().stream()
                .filter(prod -> prod.getTimestamp().isAfter(thirtyDaysAgo))
                .filter(prod -> prod.getProduct() != null)
                .filter(prod -> productIdToBox.containsKey(prod.getProduct().getId()))
                .collect(Collectors.toList());

        // Count production days
        long daysWithProduction = productionRecords.stream()
                .map(prod -> prod.getTimestamp().toLocalDate())
                .distinct()
                .count();
        
        if (daysWithProduction == 0) daysWithProduction = 1;

        // Group by product (which maps to box)
        Map<Integer, List<Production>> productionByProduct = productionRecords.stream()
                .collect(Collectors.groupingBy(prod -> prod.getProduct().getId()));

        Map<Integer, BigDecimal> dailyConsumptionMap = new HashMap<>();
        final long finalDaysWithProduction = daysWithProduction;
        
        for (Map.Entry<Integer, List<Production>> entry : productionByProduct.entrySet()) {
            Integer productId = entry.getKey();
            Box box = productIdToBox.get(productId);
            
            if (box == null) continue;
            
            // Calculate boxes consumed (production quantity is in PADS, need to convert to BOXES)
            BigDecimal totalBoxesUsed = entry.getValue().stream()
                    .map(prod -> {
                        Integer padsPerBox = prod.getProduct().getPadsPerBox();
                        if (padsPerBox == null || padsPerBox == 0) padsPerBox = 10;
                        Integer qtyProduced = prod.getQuantityProduced();
                        if (qtyProduced == null) qtyProduced = 0;
                        // Divide pads produced by pads per box to get boxes consumed
                        return BigDecimal.valueOf(qtyProduced).divide(
                                BigDecimal.valueOf(padsPerBox), 0, BigDecimal.ROUND_UP);
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calculate daily average (match reorder-points calculation exactly)
            BigDecimal dailyConsumption = totalBoxesUsed
                    .divide(BigDecimal.valueOf(finalDaysWithProduction), 0, BigDecimal.ROUND_UP);
            
            dailyConsumptionMap.put(box.getId(), dailyConsumption);
        }
        
        return dailyConsumptionMap;
    }

    @Override
    public List<ProductionTrendDTO> getProductionTrend(int days) {
        log.debug("Fetching production trend for {} days", days);
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        List<ProductionTrendDTO> trends = new ArrayList<>();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

            List<Production> dailyProductions = productionRepository.findByTimestampBetween(startOfDay, endOfDay);

            Map<String, Long> productWise = dailyProductions.stream()
                    .collect(Collectors.groupingBy(
                            p -> p.getProduct().getName(),
                            Collectors.summingLong(Production::getQuantityProduced)
                    ));

            long total = dailyProductions.stream()
                    .mapToLong(Production::getQuantityProduced)
                    .sum();

            trends.add(ProductionTrendDTO.builder()
                    .date(date)
                    .totalQuantity(total)
                    .productWiseQuantity(productWise)
                    .build());
        }

        return trends;
    }

    @Override
    public List<TopProductDTO> getTopProductsByStock(int limit) {
        log.debug("Fetching top {} products by stock value", limit);

        return finishedGoodsStockRepository.findAll().stream()
                .map(stock -> {
                    Product product = stock.getProduct();
                    BigDecimal costPerBox = getProductCostPrice(product);
                    BigDecimal costPerPad = product.getPadsPerBox() != null && product.getPadsPerBox() > 0 ?
                            costPerBox.divide(BigDecimal.valueOf(product.getPadsPerBox()), 2, BigDecimal.ROUND_HALF_UP) :
                            BigDecimal.ZERO;

                    // Value from complete boxes
                    BigDecimal boxValue = costPerBox.multiply(BigDecimal.valueOf(stock.getBoxQuantity()));

                    // Value from loose pads
                    BigDecimal loosePadValue = costPerPad.multiply(BigDecimal.valueOf(stock.getLoosePads()));

                    BigDecimal totalValue = boxValue.add(loosePadValue);
                    int totalPads = (stock.getBoxQuantity() * 
                            (product.getPadsPerBox() != null ? product.getPadsPerBox() : 0)) + 
                            stock.getLoosePads();

                    return TopProductDTO.builder()
                            .productId(product.getId())
                            .productName(product.getName())
                            .stockQuantity((long) totalPads)
                            .boxQuantity(stock.getBoxQuantity())
                            .loosePads(stock.getLoosePads())
                            .stockValue(totalValue)
                            .transactionCount(0L) // Can be enhanced with actual transaction count
                            .build();
                })
                .sorted(Comparator.comparing(TopProductDTO::getStockValue).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public List<TopProductDTO> getTopProductsByQuantity(int limit) {
        log.debug("Fetching top {} products by stock quantity", limit);

        return finishedGoodsStockRepository.findAll().stream()
                .map(stock -> {
                    Product product = stock.getProduct();
                    BigDecimal costPerBox = getProductCostPrice(product);
                    BigDecimal costPerPad = product.getPadsPerBox() != null && product.getPadsPerBox() > 0 ?
                            costPerBox.divide(BigDecimal.valueOf(product.getPadsPerBox()), 2, BigDecimal.ROUND_HALF_UP) :
                            BigDecimal.ZERO;

                    // Value from complete boxes
                    BigDecimal boxValue = costPerBox.multiply(BigDecimal.valueOf(stock.getBoxQuantity()));

                    // Value from loose pads
                    BigDecimal loosePadValue = costPerPad.multiply(BigDecimal.valueOf(stock.getLoosePads()));

                    BigDecimal totalValue = boxValue.add(loosePadValue);
                    int totalPads = (stock.getBoxQuantity() * 
                            (product.getPadsPerBox() != null ? product.getPadsPerBox() : 0)) + 
                            stock.getLoosePads();

                    return TopProductDTO.builder()
                            .productId(product.getId())
                            .productName(product.getName())
                            .stockQuantity((long) totalPads)
                            .boxQuantity(stock.getBoxQuantity())
                            .loosePads(stock.getLoosePads())
                            .stockValue(totalValue)
                            .transactionCount(0L)
                            .build();
                })
                .sorted(Comparator.comparing(TopProductDTO::getStockQuantity).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    // Helper methods
    private BigDecimal calculateTotalStockValue() {
        StockBreakdownDTO breakdown = getStockBreakdown();
        return breakdown.getRawMaterialStockValue()
                .add(breakdown.getFinishedGoodsStockValue())
                .add(breakdown.getBoxStockValue());
    }

    private long countLowStockItems() {
        long rawMaterialLowStock = rawMaterialStockRepository.findAll().stream()
                .filter(stock -> stock.getMinStockLevel() != null && 
                        stock.getQuantity().compareTo(stock.getMinStockLevel()) < 0)
                .count();

        long boxLowStock = boxStockRepository.findAll().stream()
                .filter(stock -> stock.getMinStockLevel() != null && 
                        stock.getQuantity() < stock.getMinStockLevel())
                .count();

        // Note: Finished goods products don't have minStockLevel field in current schema
        // If you add minStockLevel to Product model in future, uncomment below:
        // long finishedGoodsLowStock = finishedGoodsStockRepository.findAll().stream()
        //         .filter(stock -> stock.getProduct().getMinStockLevel() != null)
        //         .filter(stock -> {
        //             int totalPads = (stock.getBoxQuantity() * stock.getProduct().getPadsPerBox()) + stock.getLoosePads();
        //             return totalPads < stock.getProduct().getMinStockLevel();
        //         })
        //         .count();
        
        return rawMaterialLowStock + boxLowStock; // + finishedGoodsLowStock (when implemented)
    }

    private String calculateSeverity(BigDecimal current, BigDecimal minimum) {
        if (current.compareTo(BigDecimal.ZERO) == 0) {
            return "CRITICAL";
        }
        
        BigDecimal percentage = current.divide(minimum, 2, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        if (percentage.compareTo(BigDecimal.valueOf(25)) < 0) {
            return "CRITICAL";
        } else if (percentage.compareTo(BigDecimal.valueOf(50)) < 0) {
            return "WARNING";
        }
        return "LOW";
    }

    /**
     * Get the correct cost price for a product for inventory valuation.
     * Returns cost per box. Prioritizes calculatedCostPrice if available and up-to-date,
     * otherwise falls back to costPrice. Both represent cost per box.
     */
    private BigDecimal getProductCostPrice(Product product) {
        if (product == null) {
            return BigDecimal.ZERO;
        }

        // Use calculated cost price if it's available and not dirty (up-to-date)
        if (product.getCalculatedCostPrice() != null &&
            (product.getCostDirty() == null || !product.getCostDirty())) {
            return product.getCalculatedCostPrice();
        }

        // Fall back to manually set cost price
        return product.getCostPrice() != null ? product.getCostPrice() : BigDecimal.ZERO;
    }

    @Override
    public List<MaterialConsumptionDTO> getMaterialConsumption() {
        log.debug("Calculating material consumption rates");
        
        // Get usage data from last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<RawMaterialUsage> usageRecords = rawMaterialUsageRepository.findAll().stream()
                .filter(usage -> usage.getTimestamp().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());

        // Group by material and calculate consumption
        Map<Integer, List<RawMaterialUsage>> usageByMaterial = usageRecords.stream()
                .collect(Collectors.groupingBy(usage -> usage.getMaterial().getId()));

        List<MaterialConsumptionDTO> result = new ArrayList<>();
        
        for (Map.Entry<Integer, List<RawMaterialUsage>> entry : usageByMaterial.entrySet()) {
            RawMaterial material = entry.getValue().get(0).getMaterial();
            List<RawMaterialUsage> materialUsages = entry.getValue();
            
            // Calculate total usage
            BigDecimal totalUsage = materialUsages.stream()
                    .map(RawMaterialUsage::getQtyUsed)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calculate number of days with data
            long daysWithData = materialUsages.stream()
                    .map(usage -> usage.getTimestamp().toLocalDate())
                    .distinct()
                    .count();
            
            if (daysWithData == 0) daysWithData = 1; // Avoid division by zero
            
            // Calculate daily and weekly averages
            BigDecimal dailyConsumption = totalUsage.divide(
                    BigDecimal.valueOf(daysWithData), 2, BigDecimal.ROUND_HALF_UP);
            BigDecimal weeklyConsumption = dailyConsumption.multiply(BigDecimal.valueOf(7));
            
            // Get current stock
            BigDecimal currentStock = rawMaterialStockRepository
                    .findByMaterial(material)
                    .map(RawMaterialStock::getQuantity)
                    .orElse(BigDecimal.ZERO);
            
            // Calculate days of supply
            Integer daysOfSupply = 0;
            if (dailyConsumption.compareTo(BigDecimal.ZERO) > 0) {
                daysOfSupply = currentStock.divide(dailyConsumption, 0, BigDecimal.ROUND_DOWN).intValue();
            }
            
            // Determine status
            MaterialConsumptionDTO.ConsumptionStatus status;
            if (daysOfSupply >= 15) {
                status = MaterialConsumptionDTO.ConsumptionStatus.HEALTHY;
            } else if (daysOfSupply >= 7) {
                status = MaterialConsumptionDTO.ConsumptionStatus.WARNING;
            } else {
                status = MaterialConsumptionDTO.ConsumptionStatus.CRITICAL;
            }
            
            result.add(MaterialConsumptionDTO.builder()
                    .materialId(material.getId())
                    .materialName(material.getName())
                    .dailyConsumption(dailyConsumption)
                    .weeklyConsumption(weeklyConsumption)
                    .currentStock(currentStock)
                    .daysOfSupply(daysOfSupply)
                    .unit("kg")
                    .status(status)
                    .build());
        }
        
        // Sort by status (CRITICAL first) then by days of supply
        result.sort(Comparator
                .comparing(MaterialConsumptionDTO::getStatus)
                .thenComparing(MaterialConsumptionDTO::getDaysOfSupply));
        
        return result;
    }

    @Override
    public List<ReorderPointDTO> getReorderPoints() {
        log.debug("Calculating reorder points");
        
        List<ReorderPointDTO> result = new ArrayList<>();
        
        // Calculate for raw materials
        List<RawMaterial> materials = rawMaterialRepository.findAll();
        for (RawMaterial material : materials) {
            ReorderPointDTO reorderPoint = calculateMaterialReorderPoint(material);
            if (reorderPoint != null) {
                result.add(reorderPoint);
            }
        }
        
        // Calculate for boxes
        List<Box> boxes = boxRepository.findAll();
        for (Box box : boxes) {
            ReorderPointDTO reorderPoint = calculateBoxReorderPoint(box);
            if (reorderPoint != null) {
                result.add(reorderPoint);
            }
        }
        
        // Sort by urgency (shouldReorderNow first, then by days until stockout)
        result.sort(Comparator
                .comparing(ReorderPointDTO::getShouldReorderNow, Comparator.reverseOrder())
                .thenComparing(dto -> dto.getStockoutDate() != null ? dto.getStockoutDate() : LocalDate.MAX));
        
        return result;
    }

    private ReorderPointDTO calculateMaterialReorderPoint(RawMaterial material) {
        // Get usage from last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<RawMaterialUsage> usageRecords = rawMaterialUsageRepository.findAll().stream()
                .filter(usage -> usage.getMaterial().getId().equals(material.getId()))
                .filter(usage -> usage.getTimestamp().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());
        
        if (usageRecords.isEmpty()) {
            return null; // No usage data, skip
        }
        
        // Calculate daily consumption
        BigDecimal totalUsage = usageRecords.stream()
                .map(RawMaterialUsage::getQtyUsed)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long daysWithData = usageRecords.stream()
                .map(usage -> usage.getTimestamp().toLocalDate())
                .distinct()
                .count();
        
        if (daysWithData == 0) daysWithData = 1;
        
        BigDecimal dailyConsumption = totalUsage.divide(
                BigDecimal.valueOf(daysWithData), 2, BigDecimal.ROUND_HALF_UP);
        
        if (dailyConsumption.compareTo(BigDecimal.ZERO) == 0) {
            return null; // No consumption, skip
        }
        
        // Get current stock
        BigDecimal currentStock = rawMaterialStockRepository
                .findByMaterial(material)
                .map(RawMaterialStock::getQuantity)
                .orElse(BigDecimal.ZERO);
        
        // Calculate reorder parameters
        int leadTimeDays = 7; // Default lead time (can be customized per material)
        BigDecimal safetyStock = dailyConsumption.multiply(BigDecimal.valueOf(3)); // 3 days safety stock
        BigDecimal reorderPoint = dailyConsumption.multiply(BigDecimal.valueOf(leadTimeDays)).add(safetyStock);
        
        // Economic Order Quantity (simplified Wilson formula)
        // EOQ = 14 days of consumption
        BigDecimal eoq = dailyConsumption.multiply(BigDecimal.valueOf(14));
        
        // Suggested order quantity
        BigDecimal suggestedOrderQty = eoq;
        if (currentStock.compareTo(reorderPoint) <= 0) {
            // If already below reorder point, order enough to reach EOQ level
            BigDecimal deficit = reorderPoint.subtract(currentStock);
            suggestedOrderQty = deficit.add(eoq);
        }
        
        // Calculate stockout date
        LocalDate stockoutDate = null;
        if (currentStock.compareTo(BigDecimal.ZERO) > 0) {
            int daysUntilStockout = currentStock.divide(dailyConsumption, 0, BigDecimal.ROUND_DOWN).intValue();
            stockoutDate = LocalDate.now().plusDays(daysUntilStockout);
        } else {
            stockoutDate = LocalDate.now(); // Already out of stock
        }
        
        boolean shouldReorderNow = currentStock.compareTo(reorderPoint) <= 0;
        
        return ReorderPointDTO.builder()
                .itemType("RAW_MATERIAL")
                .itemId(material.getId())
                .itemName(material.getName())
                .currentStock(currentStock)
                .dailyConsumption(dailyConsumption)
                .leadTimeDays(leadTimeDays)
                .safetyStock(safetyStock)
                .reorderPoint(reorderPoint)
                .suggestedOrderQty(suggestedOrderQty)
                .economicOrderQty(eoq)
                .shouldReorderNow(shouldReorderNow)
                .stockoutDate(stockoutDate)
                .unit("kg")
                .build();
    }

    private ReorderPointDTO calculateBoxReorderPoint(Box box) {
        // Get production data from last 30 days to estimate box consumption
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        
        // Filter productions for this box's product
        List<Production> recentProductions = productionRepository.findAll().stream()
                .filter(prod -> prod.getTimestamp() != null)
                .filter(prod -> prod.getTimestamp().isAfter(thirtyDaysAgo))
                .filter(prod -> prod.getProduct() != null)
                .filter(prod -> box.getProduct() != null && prod.getProduct().getId().equals(box.getProduct().getId()))
                .collect(Collectors.toList());
        
        if (recentProductions.isEmpty()) {
            return null; // No usage data
        }
        
        // Calculate boxes consumed (each production uses boxes based on padsPerBox)
        BigDecimal totalBoxesUsed = recentProductions.stream()
                .map(prod -> {
                    Integer padsPerBox = prod.getProduct().getPadsPerBox();
                    if (padsPerBox == null || padsPerBox == 0) padsPerBox = 10;
                    Integer qtyProduced = prod.getQuantityProduced();
                    if (qtyProduced == null) qtyProduced = 0;
                    return BigDecimal.valueOf(qtyProduced).divide(
                            BigDecimal.valueOf(padsPerBox), 0, BigDecimal.ROUND_UP);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long daysWithData = recentProductions.stream()
                .map(prod -> prod.getTimestamp().toLocalDate())
                .distinct()
                .count();
        
        if (daysWithData == 0) daysWithData = 1;
        
        BigDecimal dailyConsumption = totalBoxesUsed.divide(
                BigDecimal.valueOf(daysWithData), 0, BigDecimal.ROUND_UP);
        
        if (dailyConsumption.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        
        // Get current stock
        BigDecimal currentStock = boxStockRepository
                .findByBox(box)
                .map(stock -> BigDecimal.valueOf(stock.getQuantity() != null ? stock.getQuantity() : 0))
                .orElse(BigDecimal.ZERO);
        
        // Calculate reorder parameters
        int leadTimeDays = 14; // Boxes typically have longer lead time
        BigDecimal safetyStock = dailyConsumption.multiply(BigDecimal.valueOf(5)); // 5 days safety stock
        BigDecimal reorderPoint = dailyConsumption.multiply(BigDecimal.valueOf(leadTimeDays)).add(safetyStock);
        
        // EOQ: 21 days of consumption
        BigDecimal eoq = dailyConsumption.multiply(BigDecimal.valueOf(21));
        
        // Suggested order quantity
        BigDecimal suggestedOrderQty = eoq;
        if (currentStock.compareTo(reorderPoint) <= 0) {
            BigDecimal deficit = reorderPoint.subtract(currentStock);
            suggestedOrderQty = deficit.add(eoq);
        }
        
        // Calculate stockout date
        LocalDate stockoutDate = null;
        if (currentStock.compareTo(BigDecimal.ZERO) > 0) {
            int daysUntilStockout = currentStock.divide(dailyConsumption, 0, BigDecimal.ROUND_DOWN).intValue();
            stockoutDate = LocalDate.now().plusDays(daysUntilStockout);
        } else {
            stockoutDate = LocalDate.now();
        }
        
        boolean shouldReorderNow = currentStock.compareTo(reorderPoint) <= 0;
        
        return ReorderPointDTO.builder()
                .itemType("BOX")
                .itemId(box.getId())
                .itemName(box.getName())
                .currentStock(currentStock)
                .dailyConsumption(dailyConsumption)
                .leadTimeDays(leadTimeDays)
                .safetyStock(safetyStock)
                .reorderPoint(reorderPoint)
                .suggestedOrderQty(suggestedOrderQty)
                .economicOrderQty(eoq)
                .shouldReorderNow(shouldReorderNow)
                .stockoutDate(stockoutDate)
                .unit("pcs")
                .build();
    }
}
