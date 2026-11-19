package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.ChangePasswordRequestDTO;
import com.way2care.inventorymanagement.dto.LoginRequestDTO;
import com.way2care.inventorymanagement.dto.LoginResponseDTO;
import com.way2care.inventorymanagement.service.LoginService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class LoginController {

    private final LoginService loginService;

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO request) {
        return loginService.login(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        loginService.logout(token.substring(7));
        return ResponseEntity.ok().build();
    }
}
