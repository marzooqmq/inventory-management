package com.way2care.inventorymanagement.service.impl;

import com.way2care.inventorymanagement.dto.LoginRequestDTO;
import com.way2care.inventorymanagement.dto.LoginResponseDTO;
import com.way2care.inventorymanagement.model.AppUser;
import com.way2care.inventorymanagement.model.JwtBlacklist;
import com.way2care.inventorymanagement.model.Roles;
import com.way2care.inventorymanagement.repository.AppUserRepository;
import com.way2care.inventorymanagement.repository.JwtBlacklistRepository;
import com.way2care.inventorymanagement.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoginServiceImplTest {

    @Mock private AppUserRepository appUserRepository;
    @Mock private JwtBlacklistRepository jwtBlacklistRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks private LoginServiceImpl loginService;

    @Test
    void loginReturnsTokenForActiveUserWithValidPassword() {
        AppUser user = user(true);
        LoginRequestDTO request = loginRequest("correct-password");
        when(appUserRepository.findByUsername("accountant")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-password", "encoded-password")).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("signed-token");

        LoginResponseDTO response = loginService.login(request);

        assertEquals("signed-token", response.getToken());
        assertFalse(response.isPasswordChanged());
        verify(jwtUtil).generateToken(user);
    }

    @Test
    void loginRejectsUnknownUsernameWithUnauthorizedStatus() {
        when(appUserRepository.findByUsername("unknown")).thenReturn(Optional.empty());
        LoginRequestDTO request = loginRequest("any-password");
        request.setUsername("unknown");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> loginService.login(request));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        verifyNoInteractions(passwordEncoder, jwtUtil);
    }

    @Test
    void loginRejectsInvalidPasswordWithUnauthorizedStatus() {
        AppUser user = user(true);
        when(appUserRepository.findByUsername("accountant")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> loginService.login(loginRequest("wrong-password")));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    void loginRejectsInactiveUserBeforeCheckingPassword() {
        AppUser user = user(false);
        when(appUserRepository.findByUsername("accountant")).thenReturn(Optional.of(user));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> loginService.login(loginRequest("correct-password")));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verifyNoInteractions(passwordEncoder, jwtUtil);
    }

    @Test
    void logoutStoresTokenHashAndExpiryInsteadOfRawToken() {
        String token = "signed-token";
        String tokenHash = "sha256-token-hash";
        Instant expiry = Instant.parse("2030-01-01T00:00:00Z");
        when(jwtUtil.hash(token)).thenReturn(tokenHash);
        when(jwtUtil.extractExpiry(token)).thenReturn(expiry);

        loginService.logout(token);

        ArgumentCaptor<JwtBlacklist> blacklistCaptor = ArgumentCaptor.forClass(JwtBlacklist.class);
        verify(jwtBlacklistRepository).save(blacklistCaptor.capture());
        assertEquals(tokenHash, blacklistCaptor.getValue().getTokenHash());
        assertEquals(expiry, blacklistCaptor.getValue().getExpiresAt());
        assertNotEquals(token, blacklistCaptor.getValue().getTokenHash());
    }

    private AppUser user(boolean active) {
        return AppUser.builder()
                .id(9)
                .username("accountant")
                .password("encoded-password")
                .role(Roles.ACCOUNTANT)
                .active(active)
                .passwordChanged(false)
                .build();
    }

    private LoginRequestDTO loginRequest(String password) {
        LoginRequestDTO request = new LoginRequestDTO();
        request.setUsername("accountant");
        request.setPassword(password);
        return request;
    }
}
