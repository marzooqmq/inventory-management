package com.way2care.inventorymanagement.service;

import com.way2care.inventorymanagement.dto.AppUserRequestDTO;
import com.way2care.inventorymanagement.dto.AppUserResponseDTO;
import com.way2care.inventorymanagement.dto.AppUserUpdateRequestDTO;
import com.way2care.inventorymanagement.dto.ChangePasswordRequestDTO;

import java.util.List;

public interface AppUserService {
    List<AppUserResponseDTO> getAll();
    AppUserResponseDTO getById(Integer id);
    AppUserResponseDTO create(AppUserRequestDTO request);
    AppUserResponseDTO update(Integer id, AppUserUpdateRequestDTO request);

    void activate(Integer id);

    void deactivate(Integer id);

    public String changePassword(String username, ChangePasswordRequestDTO request);
}
