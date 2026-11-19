package com.way2care.inventorymanagement.service;

import org.springframework.core.io.InputStreamResource;

import java.util.Map;

public interface InvoicePdfService {
    public Map.Entry<String, InputStreamResource> generateInvoicePdf(Integer id);
}
