package com.way2care.inventorymanagement.repository;

import com.way2care.inventorymanagement.model.JwtBlacklist;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface JwtBlacklistRepository extends JpaRepository<JwtBlacklist, Integer> {

    boolean existsByTokenHashAndExpiresAtAfter(String tokenHash, Instant now);

    @Modifying
    @Transactional
    @Query("DELETE FROM JwtBlacklist j WHERE j.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") Instant now);
}
