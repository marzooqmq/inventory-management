package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.DiscountSlab;
import com.way2care.inventorymanagement.model.DiscountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DiscountSlabRepository extends JpaRepository<DiscountSlab, Integer> {

    List<DiscountSlab> findByActiveTrue();
}
