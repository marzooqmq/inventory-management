package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    long countByActive(Boolean active);
}
