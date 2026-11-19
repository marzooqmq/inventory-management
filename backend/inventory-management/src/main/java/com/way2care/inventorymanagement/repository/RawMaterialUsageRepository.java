package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.ProductionOrder;
import com.way2care.inventorymanagement.model.RawMaterialUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RawMaterialUsageRepository extends JpaRepository<RawMaterialUsage, Integer> {
    List<RawMaterialUsage> findByProductionOrder(ProductionOrder order);
}
