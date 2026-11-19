package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.RawMaterial;
import com.way2care.inventorymanagement.model.RawMaterialStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RawMaterialStockRepository extends JpaRepository<RawMaterialStock, Integer> {
    Optional<RawMaterialStock> findByMaterial(RawMaterial material);

    boolean existsByMaterialId(Integer materialId);
}
