package com.test.inventory.service;

import com.test.inventory.config.AuthenticatedUser;
import com.test.inventory.exception.UnauthorizedException;
import com.test.inventory.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class AuthenticatedUserService implements UserDetailsService {

    private final UserRepository userRepository;

    public AuthenticatedUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public AuthenticatedUser loadUserByUsername(String username) {
        return loadAuthenticatedUserByUsername(username);
    }

    public AuthenticatedUser loadAuthenticatedUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(AuthenticatedUser::new)
                .orElseThrow(() -> new UnauthorizedException("Usuario no autorizado"));
    }

    public AuthenticatedUser getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof AuthenticatedUser authenticatedUser) {
            return authenticatedUser;
        }
        throw new UnauthorizedException("Usuario no autenticado");
    }
}
