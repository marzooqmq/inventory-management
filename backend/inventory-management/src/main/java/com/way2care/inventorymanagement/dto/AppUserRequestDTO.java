package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.Roles;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppUserRequestDTO {
    @NotBlank(message = "Username cannot be empty")
    private String username;

    @NotBlank(message = "Password cannot be empty")
    private String password;

    @NotNull(message = "Role cannot be empty")
    private Roles role;
}
