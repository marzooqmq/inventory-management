package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.ProductConversion;
import com.way2care.inventorymanagement.model.UnitType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductConversionRepository extends JpaRepository<ProductConversion, Integer> {
    Optional<ProductConversion> findByProductAndUnitName(Product product, UnitType unitType);
}
