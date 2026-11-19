package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.CustomerRequestDTO;
import com.way2care.inventorymanagement.dto.CustomerResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.Customer;
import com.way2care.inventorymanagement.repository.CustomerRepository;
import com.way2care.inventorymanagement.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public List<CustomerResponseDTO> getAll() {
        return customerRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public CustomerResponseDTO getById(Integer id) {
        return customerRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    @Override
    public CustomerResponseDTO create(CustomerRequestDTO request) {
        Customer customer = Customer.builder()
                .name(request.getName())
                .address(request.getAddress())
                .district(request.getDistrict())
                .state(request.getState())
                .country(request.getCountry())
                .zipCode(request.getZipCode())
                .phone(request.getPhone())
                .type(request.getType())
                .discount(request.getDiscount())
                .build();
        Customer saved = customerRepository.save(customer);
        return toResponse(saved);
    }

    @Override
    public CustomerResponseDTO update(Integer id, CustomerRequestDTO request) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        existing.setName(request.getName());
        existing.setAddress(request.getAddress());
        existing.setDistrict(request.getDistrict());
        existing.setState(request.getState());
        existing.setCountry(request.getCountry());
        existing.setZipCode(request.getZipCode());
        existing.setPhone(request.getPhone());
        existing.setType(request.getType());
        existing.setDiscount(request.getDiscount());
        customerRepository.save(existing);
        return toResponse(existing);
    }

    @Override
    public void delete(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        customerRepository.delete(customer);
    }

    @Override
    public List<CustomerResponseDTO> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAll();
        }
        return customerRepository.searchByNameOrPhone(query.trim())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private CustomerResponseDTO toResponse(Customer customer) {
        return CustomerResponseDTO.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .district(customer.getDistrict())
                .state(customer.getState())
                .country(customer.getCountry())
                .zipCode(customer.getZipCode())
                .type(String.valueOf(customer.getType()))
                .discount(customer.getDiscount())
                .build();
    }
}
