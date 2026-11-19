package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.CustomerType;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.ProductPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductPriceRepository extends JpaRepository<ProductPrice, Integer> {
    Optional<ProductPrice> findByProductAndCustomerType(Product product, CustomerType customerType);
}
