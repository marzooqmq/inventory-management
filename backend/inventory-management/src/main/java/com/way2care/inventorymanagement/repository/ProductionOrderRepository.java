package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.ProductionOrder;
import com.way2care.inventorymanagement.model.ProductionOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, Integer> {
    long countByStatus(ProductionOrderStatus status);
    long countByStatusNotIn(List<ProductionOrderStatus> statuses);
}
