package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.BOMRequestDTO;
import com.way2care.inventorymanagement.dto.BOMResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.BillOfMaterial;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.RawMaterial;
import com.way2care.inventorymanagement.repository.BillOfMaterialRepository;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.repository.RawMaterialRepository;
import com.way2care.inventorymanagement.service.BillOfMaterialService;
import com.way2care.inventorymanagement.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillOfMaterialServiceImpl implements BillOfMaterialService {

    private final BillOfMaterialRepository billOfMaterialRepository;
    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductService productService;

    @Override
    public List<BOMResponseDTO> getAll() {
        return billOfMaterialRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public BOMResponseDTO getById(Integer id) {
        BillOfMaterial bom = billOfMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill of Material not found"));
        return toResponse(bom);
    }

    @Override
    public BOMResponseDTO create(BOMRequestDTO request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        RawMaterial rawMaterial = rawMaterialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found"));

        BillOfMaterial bom = BillOfMaterial.builder()
                .product(product)
                .material(rawMaterial)
                .qtyRequired(request.getQtyRequired())
                .build();

        BillOfMaterial saved = billOfMaterialRepository.save(bom);
        productService.calculateProductCost(product.getId());
        return toResponse(saved);
    }

    @Override
    public BOMResponseDTO update(Integer id, BOMResponseDTO request) {

        BillOfMaterial existingBOM = billOfMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill of Material not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        RawMaterial material = rawMaterialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new RuntimeException("Raw Material not found"));

        existingBOM.setProduct(product);
        existingBOM.setMaterial(material);
        if (request.getQtyRequired() != null) {
            existingBOM.setQtyRequired(request.getQtyRequired());
        }
        billOfMaterialRepository.save(existingBOM);

        productService.calculateProductCost(existingBOM.getProduct().getId());
        return toResponse(existingBOM);
    }

    @Override
    public void delete(Integer id) {
        BillOfMaterial bom = billOfMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill of Material not found"));
        billOfMaterialRepository.delete(bom);
        productService.calculateProductCost(bom.getProduct().getId());
    }

    @Override
    public List<BOMResponseDTO> createAll(List<BOMRequestDTO> requests) {
        List<BOMResponseDTO> response = new ArrayList<>();
        for(BOMRequestDTO request : requests) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            RawMaterial rawMaterial = rawMaterialRepository.findById(request.getMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found"));

            BillOfMaterial bom = BillOfMaterial.builder()
                    .product(product)
                    .material(rawMaterial)
                    .qtyRequired(request.getQtyRequired())
                    .build();

            BillOfMaterial saved = billOfMaterialRepository.save(bom);
            response.add(toResponse(saved));
        }
        Set<Integer> productsIds = requests.stream()
                .map(BOMRequestDTO::getProductId)
                .collect(Collectors.toSet());

        for(Integer productId : productsIds) {
            productService.calculateProductCost(productId);
        }
        return response;
    }

    private BOMResponseDTO toResponse(BillOfMaterial bom) {
        return BOMResponseDTO.builder()
                .id(bom.getId())
                .productId(bom.getProduct().getId())
                .productName(bom.getProduct().getName())
                .materialId(bom.getMaterial().getId())
                .materialName(bom.getMaterial().getName())
                .qtyRequired(bom.getQtyRequired())
                .build();
    }
}