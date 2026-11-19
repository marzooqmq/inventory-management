package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RawMaterialRepository extends JpaRepository<RawMaterial, Integer> {
}
