package com.way2care.inventorymanagement.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name= "report_dummy")
public class ReportDummy {
    @Id
    private Integer id;
}
