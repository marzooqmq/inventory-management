package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Integer> {
    boolean existsByUsername(String username);

    Optional<AppUser> findByUsername(String username);
}
