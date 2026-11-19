package com.way2care.inventorymanagement.config;

import com.way2care.inventorymanagement.model.AppUser;
import com.way2care.inventorymanagement.model.Roles;
import com.way2care.inventorymanagement.repository.AppUserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class InitialAdminBootstrap implements ApplicationRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final String initialAdminUsername;
    private final String initialAdminPassword;

    public InitialAdminBootstrap(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            @Value("${INITIAL_ADMIN_USERNAME:}") String initialAdminUsername,
            @Value("${INITIAL_ADMIN_PASSWORD:}") String initialAdminPassword) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.initialAdminUsername = initialAdminUsername;
        this.initialAdminPassword = initialAdminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (appUserRepository.count() > 0) {
            log.info("Skipping initial admin setup because users already exist.");
            return;
        }

        if (initialAdminUsername == null || initialAdminUsername.isBlank()
                || initialAdminPassword == null || initialAdminPassword.isBlank()) {
            throw new IllegalStateException(
                    "No users exist. Set INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD to create the first ADMIN account.");
        }

        AppUser initialAdmin = AppUser.builder()
                .username(initialAdminUsername.trim())
                .password(passwordEncoder.encode(initialAdminPassword))
                .role(Roles.ADMIN)
                .active(true)
                .passwordChanged(false)
                .build();

        appUserRepository.save(initialAdmin);
        log.info("Created the initial ADMIN account. Change its password after first login.");
    }
}
