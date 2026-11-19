package com.way2care.inventorymanagement.config;

import com.way2care.inventorymanagement.security.JwtAuthenticationFilter;
import com.way2care.inventorymanagement.security.PasswordChangeEnforcementFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final PasswordChangeEnforcementFilter passwordChangeEnforcementFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/users/change-password").authenticated()

                        // ADMIN ONLY APIs
                        .requestMatchers(
                                "/users/**", "/company-profile/**",
                                "/products/**", "/raw-materials/**",
                                "raw-material-usage/**",
                                "/bom/**", "/boxes/**", "/production-costs/**",
                                "/box-stocks/**", "/discount-slabs/**",
                                "/product-prices/**", "/product-conversions/**",
                                "/product-costs/**", "/stock-transactions/**",
                                "/profit-reports/**"
                        ).hasRole("ADMIN")

                        // Production Manager and Admin APIs
                        .requestMatchers(
                                "/productions/**", "/raw-material-stocks/**",
                                "/finished-stock/**", "/production-orders/**",
                                "/production-executions/**", "/production-reports/**"
                        ).hasAnyRole("ADMIN", "PRODUCTION_MANAGER")

                        // Accountant and Admin APIs
                        .requestMatchers(
                                "/invoices/**", "/invoice-items/**",
                                "/sales-reports/**", "/customers/**",
                                "/sales-dashboard/**", "/reports/outstanding/**"
                        ).hasAnyRole("ADMIN", "ACCOUNTANT")

                        // Accessed to everyone logged in
                        .requestMatchers("/production-vs-sales/**", "/inventory-dashboard/**").authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                .addFilterAfter(passwordChangeEnforcementFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:4200", "http://localhost:3000")); // Adjust as needed
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Content-Type", "Cache-Control", "X-Accel-Buffering")); // Required for SSE
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
