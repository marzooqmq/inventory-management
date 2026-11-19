package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.AppUserRequestDTO;
import com.way2care.inventorymanagement.dto.AppUserResponseDTO;
import com.way2care.inventorymanagement.dto.AppUserUpdateRequestDTO;
import com.way2care.inventorymanagement.dto.ChangePasswordRequestDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.AppUser;
import com.way2care.inventorymanagement.repository.AppUserRepository;
import com.way2care.inventorymanagement.security.JwtUtil;
import com.way2care.inventorymanagement.service.AppUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppUserServiceImpl implements AppUserService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public List<AppUserResponseDTO> getAll() {
        return appUserRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public AppUserResponseDTO getById(Integer id) {
        return appUserRepository.findById(id)
                .map(this::toResponse).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public AppUserResponseDTO create(AppUserRequestDTO request) {
        if(appUserRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
        }
        AppUser appUser = AppUser.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();
        AppUser saved = appUserRepository.save(appUser);
        return toResponse(saved);
    }

    @Override
    public AppUserResponseDTO update(Integer id, AppUserUpdateRequestDTO request) {
        AppUser existing = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getRole() != null) {
            existing.setRole(request.getRole());
        }

        appUserRepository.save(existing);
        return toResponse(existing);
    }

    @Override
    public void activate(Integer id) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(true);
        appUserRepository.save(user);
    }

    @Override
    public void deactivate(Integer id) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(false);
        appUserRepository.save(user);
    }

    @Override
    public String changePassword(String username, ChangePasswordRequestDTO request) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChanged(true);
        appUserRepository.save(user);

        return jwtUtil.generateToken(user);
    }

    private AppUserResponseDTO toResponse(AppUser appUser) {
        return AppUserResponseDTO.builder()
                .id(appUser.getId())
                .username(appUser.getUsername())
                .role(appUser.getRole())
                .active(appUser.isActive())
                .createdAt(appUser.getCreatedAt())
                .updatedAt(appUser.getUpdatedAt())
                .build();
    }
}
