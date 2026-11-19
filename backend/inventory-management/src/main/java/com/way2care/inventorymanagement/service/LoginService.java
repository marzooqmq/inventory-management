package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.ChangePasswordRequestDTO;
import com.way2care.inventorymanagement.dto.LoginRequestDTO;
import com.way2care.inventorymanagement.dto.LoginResponseDTO;

public interface LoginService {
    public LoginResponseDTO login(LoginRequestDTO request);

    public void logout(String token);
}
