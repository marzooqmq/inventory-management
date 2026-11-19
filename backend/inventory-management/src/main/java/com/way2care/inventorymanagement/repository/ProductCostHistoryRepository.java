package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.ProductCostHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductCostHistoryRepository extends JpaRepository<ProductCostHistory, Integer> {
    List<ProductCostHistory> findByProductIdOrderByValidFromDesc(Integer productId);
}
