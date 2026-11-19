package com.way2care.inventorymanagement.security;

import com.way2care.inventorymanagement.repository.JwtBlacklistRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final JwtBlacklistRepository jwtBlacklistRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;

        // First, try to get token from Authorization header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
        // For SSE connections, also check query parameter
        else if (request.getParameter("token") != null) {
            token = request.getParameter("token");
        }

        if (token != null) {
            try {
                // Blacklist check
                String tokenHash = jwtUtil.hash(token);
                boolean isBlacklisted = jwtBlacklistRepository.existsByTokenHashAndExpiresAtAfter(
                        tokenHash, Instant.now());

                if (isBlacklisted) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }

                Claims claims = jwtUtil.parseClaims(token);

                String username = claims.getSubject();
                String role = claims.get("role", String.class);
                Boolean passwordChanged = claims.get("passwordChanged", Boolean.class);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                username, null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        );

                authentication.setDetails(passwordChanged);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception e) {
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }
}
