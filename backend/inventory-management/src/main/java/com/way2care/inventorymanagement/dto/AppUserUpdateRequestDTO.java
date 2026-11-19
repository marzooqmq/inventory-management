package com.way2care.inventorymanagement.dto;

import com.way2care.inventorymanagement.model.Roles;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppUserUpdateRequestDTO {
    private Roles role;
}
