package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.Box;
import com.way2care.inventorymanagement.model.BoxStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoxStockRepository extends JpaRepository<BoxStock, Integer> {
    Optional<BoxStock> findByBox(Box box);
}
