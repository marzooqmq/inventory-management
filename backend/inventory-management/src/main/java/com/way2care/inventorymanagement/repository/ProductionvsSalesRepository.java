package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.dto.reports.productionVsSales.ProductionVsSalesMonthlyProjection;
import com.way2care.inventorymanagement.dto.reports.productionVsSales.ProductionVsSalesReportProjection;
import com.way2care.inventorymanagement.model.ReportDummy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ProductionvsSalesRepository extends JpaRepository<ReportDummy, Integer> {

    // Production vs Sales Report
    @Query(value = "SELECT * FROM get_production_vs_sales(:startDate, :endDate, :productId)", nativeQuery = true)
    List<ProductionVsSalesReportProjection> getProductionVsSalesReport(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("productId") Integer productId);

    @Query(value = "SELECT * FROM get_production_vs_sales_monthly(:startDate, :endDate, :productId)", nativeQuery = true)
    List<ProductionVsSalesMonthlyProjection> getMonthlyProductionVsSalesReport(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("productId") Integer productId);
}
