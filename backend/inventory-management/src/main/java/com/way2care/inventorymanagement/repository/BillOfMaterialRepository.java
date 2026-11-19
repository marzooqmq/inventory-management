package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.BillOfMaterial;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.model.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillOfMaterialRepository extends JpaRepository<BillOfMaterial, Integer> {

    List<BillOfMaterial> findByProduct(Product product);

    List<BillOfMaterial> findByMaterial(RawMaterial rawMaterial);
}
