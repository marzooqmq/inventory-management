package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.CustomerRequestDTO;
import com.way2care.inventorymanagement.dto.CustomerResponseDTO;

import java.util.List;

public interface CustomerService {
    List<CustomerResponseDTO> getAll();
    CustomerResponseDTO getById(Integer id);
    CustomerResponseDTO create(CustomerRequestDTO request);
    CustomerResponseDTO update(Integer id, CustomerRequestDTO request);
    void delete(Integer id);
    List<CustomerResponseDTO> search(String query);
}
