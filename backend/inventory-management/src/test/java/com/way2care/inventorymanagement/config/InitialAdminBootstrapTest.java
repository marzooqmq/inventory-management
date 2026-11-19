package com.way2care.inventorymanagement.config;

import com.way2care.inventorymanagement.model.AppUser;
import com.way2care.inventorymanagement.model.Roles;
import com.way2care.inventorymanagement.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.ApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InitialAdminBootstrapTest {

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationArguments applicationArguments;

    @Test
    void createsAdminWithEncodedPasswordWhenNoUsersExist() {
        when(appUserRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode("initial-password")).thenReturn("bcrypt-hash");
        InitialAdminBootstrap bootstrap = new InitialAdminBootstrap(
                appUserRepository, passwordEncoder, " admin ", "initial-password");

        bootstrap.run(applicationArguments);

        ArgumentCaptor<AppUser> userCaptor = ArgumentCaptor.forClass(AppUser.class);
        verify(appUserRepository).save(userCaptor.capture());
        AppUser savedUser = userCaptor.getValue();
        assertEquals("admin", savedUser.getUsername());
        assertEquals("bcrypt-hash", savedUser.getPassword());
        assertEquals(Roles.ADMIN, savedUser.getRole());
        assertTrue(savedUser.isActive());
        assertFalse(savedUser.isPasswordChanged());
    }

    @Test
    void skipsBootstrapWhenAUserAlreadyExists() {
        when(appUserRepository.count()).thenReturn(1L);
        InitialAdminBootstrap bootstrap = new InitialAdminBootstrap(
                appUserRepository, passwordEncoder, "", "");

        bootstrap.run(applicationArguments);

        verify(appUserRepository, never()).save(any());
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void failsClearlyWhenDatabaseIsEmptyAndBootstrapCredentialsAreIncomplete() {
        when(appUserRepository.count()).thenReturn(0L);
        InitialAdminBootstrap bootstrap = new InitialAdminBootstrap(
                appUserRepository, passwordEncoder, "admin", "");

        IllegalStateException exception = assertThrows(
                IllegalStateException.class, () -> bootstrap.run(applicationArguments));

        assertTrue(exception.getMessage().contains("INITIAL_ADMIN_USERNAME"));
        assertTrue(exception.getMessage().contains("INITIAL_ADMIN_PASSWORD"));
        verify(appUserRepository, never()).save(any());
        verifyNoInteractions(passwordEncoder);
    }
}
