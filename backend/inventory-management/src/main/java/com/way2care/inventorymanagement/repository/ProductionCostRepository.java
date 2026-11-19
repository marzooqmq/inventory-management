package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.ProductionCost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductionCostRepository extends JpaRepository<ProductionCost, Integer> {
    Optional<ProductionCost> findByProduct(Product product);
}
