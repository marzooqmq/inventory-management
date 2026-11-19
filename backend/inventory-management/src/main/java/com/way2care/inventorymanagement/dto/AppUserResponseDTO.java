package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.Roles;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AppUserResponseDTO {
    private Integer id;
    private String username;
    private Roles role;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
