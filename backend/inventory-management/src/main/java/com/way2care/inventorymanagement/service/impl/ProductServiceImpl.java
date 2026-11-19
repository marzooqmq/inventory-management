package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.ProductRequestDTO;
import com.way2care.inventorymanagement.dto.ProductResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.*;
import com.way2care.inventorymanagement.repository.BillOfMaterialRepository;
import com.way2care.inventorymanagement.repository.BoxRepository;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.repository.ProductionCostRepository;
import com.way2care.inventorymanagement.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BillOfMaterialRepository bomRepository;
    private final ProductionCostRepository productionCostRepository;
    private final BoxRepository boxRepository;

    @Override
    public List<ProductResponseDTO> getAll() {
        return productRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public ProductResponseDTO getById(Integer id) {
        return productRepository.findById(id)
                .map(this::toResponse).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    @Override
    public ProductResponseDTO create(ProductRequestDTO request) {
        Product product = Product.builder()
                .name(request.getName())
                .category(request.getCategory())
                .size(request.getSize())
                .description(request.getDescription())
                .padsPerBox(request.getPadsPerBox())
                .mrp(request.getMrp())
                .active(request.getActive())
                .build();
        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    @Override
    public ProductResponseDTO update(Integer id, ProductRequestDTO request) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        existing.setName(request.getName());
        existing.setCategory(request.getCategory());
        existing.setPadsPerBox(request.getPadsPerBox());
        existing.setSize(request.getSize());
        existing.setDescription(request.getDescription());
        existing.setMrp(request.getMrp());
        existing.setActive(request.getActive());

        productRepository.save(existing);
        return toResponse(existing);
    }

    @Override
    public void delete(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        productRepository.delete(product);
    }

    @Override
    public void calculateProductCost(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<BillOfMaterial> bom = bomRepository.findByProduct(product);
        if(bom.isEmpty()) {
            throw new ResourceNotFoundException("Bill of Materials not found for product id: " + id);
        }

        BigDecimal materialCostPerPad = BigDecimal.ZERO;

        //Material cost per pad
        for (BillOfMaterial item : bom) {
            RawMaterial material = item.getMaterial();

            BigDecimal qtyRequired = item.getQtyRequired();              //per pad
            BigDecimal conversionFactor = material.getConversionFactor();
            BigDecimal costPerUnit = material.getCostPerUnit();

            BigDecimal costPerPad = qtyRequired.multiply(costPerUnit)
                    .divide(conversionFactor, 6, RoundingMode.HALF_UP);

            costPerPad = round(costPerPad);  //rounding per material
            materialCostPerPad = materialCostPerPad.add(costPerPad);
        }

        //Production cost per pad
        BigDecimal productionCostPerPad = productionCostRepository.findByProduct(product)
                .map(ProductionCost::getTotalCost)
                .orElse(BigDecimal.ZERO);
        productionCostPerPad = round(productionCostPerPad);

        //Box cost per pad
        BigDecimal boxCostPerPad = boxRepository.findByProduct(product)
                .map(Box::getBoxCostPerPad)
                .orElse(BigDecimal.ZERO);

        //Total cost per pad
        BigDecimal totalCostPerPad = materialCostPerPad.add(productionCostPerPad).add(boxCostPerPad);

        totalCostPerPad = round(totalCostPerPad);

        //Total cost per box
        BigDecimal costPerBox = totalCostPerPad.multiply(BigDecimal.valueOf(product.getPadsPerBox()));
        costPerBox = round(costPerBox);

        product.setCalculatedCostPrice(costPerBox);
        product.setCostDirty(true);
        product.setCostCalculatedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    private BigDecimal round(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private ProductResponseDTO toResponse(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .category(String.valueOf(product.getCategory()))
                .size(String.valueOf(product.getSize()))
                .description(product.getDescription())
                .padsPerBox(product.getPadsPerBox())
                .mrp(product.getMrp())
                .costPrice(product.getCostPrice())
                .calculatedCostPrice(product.getCalculatedCostPrice())
                .costDirty(product.getCostDirty())
                .costCalculatedAt(product.getCostCalculatedAt())
                .active(product.getActive())
                .build();
    }
}
