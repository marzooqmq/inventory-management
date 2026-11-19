package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.Box;
import com.way2care.inventorymanagement.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoxRepository extends JpaRepository<Box, Integer> {
    Optional<Box> findByProduct(Product product);
}
