package com.way2care.inventorymanagement.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class PasswordChangeEnforcementFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated()) {
            Boolean passwordChanged = (Boolean) auth.getDetails();
            String path = request.getRequestURI();

            boolean isChangePasswordPath = path.contains("/users/change-password");
            boolean isLoginPath = path.contains("/auth/login");

            if (Boolean.FALSE.equals(passwordChanged) && !isChangePasswordPath && !isLoginPath) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("Password change required");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
