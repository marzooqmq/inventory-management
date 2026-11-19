package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.ChangePasswordRequestDTO;
import com.way2care.inventorymanagement.dto.LoginRequestDTO;
import com.way2care.inventorymanagement.dto.LoginResponseDTO;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.AppUser;
import com.way2care.inventorymanagement.model.JwtBlacklist;
import com.way2care.inventorymanagement.repository.AppUserRepository;
import com.way2care.inventorymanagement.repository.JwtBlacklistRepository;
import com.way2care.inventorymanagement.security.JwtUtil;
import com.way2care.inventorymanagement.service.LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

    private final AppUserRepository appUserRepository;
    private final JwtBlacklistRepository jwtBlacklistRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {
        AppUser user = appUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");

        String token = jwtUtil.generateToken(user);

        return new LoginResponseDTO(token, user.isPasswordChanged());
    }

    @Override
    public void logout(String token) {
        jwtBlacklistRepository.save(
                JwtBlacklist.builder()
                        .tokenHash(jwtUtil.hash(token))
                        .expiresAt(jwtUtil.extractExpiry(token))
                        .build());
    }
}
