package com.way2care.inventorymanagement.controller;

import com.way2care.inventorymanagement.dto.AppUserRequestDTO;
import com.way2care.inventorymanagement.dto.AppUserResponseDTO;
import com.way2care.inventorymanagement.dto.AppUserUpdateRequestDTO;
import com.way2care.inventorymanagement.dto.ChangePasswordRequestDTO;
import com.way2care.inventorymanagement.service.AppUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Validated
public class AppUserController {

    private final AppUserService appUserService;

    @GetMapping
    public List<AppUserResponseDTO> getAll() { return appUserService.getAll(); }

    @GetMapping("/{id}")
    public AppUserResponseDTO get(@PathVariable Integer id) { return appUserService.getById(id); }

    @PostMapping
    public AppUserResponseDTO add(@Valid @RequestBody AppUserRequestDTO request) {
        return appUserService.create(request);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequestDTO request,
                                            Authentication authentication) {
        appUserService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok().body("Password changed successfully");
    }

    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
    public AppUserResponseDTO update(@PathVariable Integer id, @Valid @RequestBody AppUserUpdateRequestDTO request) {
        return appUserService.update(id, request);
    }

}
