package com.test.inventory.service;

import com.test.inventory.config.AuthenticatedUser;
import com.test.inventory.dto.LoginRequest;
import com.test.inventory.dto.LoginResponse;
import com.test.inventory.dto.UserResponse;
import com.test.inventory.exception.UnauthorizedException;
import com.test.inventory.model.User;
import com.test.inventory.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticatedUserService authenticatedUserService;

    public AuthService(UserRepository userRepository,
                       JwtService jwtService,
                       AuthenticatedUserService authenticatedUserService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authenticatedUserService = authenticatedUserService;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new UnauthorizedException("Usuario o contraseña incorrectos"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Usuario inactivo");
        }

        if (!user.getPassword().equals(request.password())) {
            throw new UnauthorizedException("Usuario o contraseña incorrectos");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, "Bearer", toUserResponse(user));
    }

    public UserResponse getCurrentUser() {
        AuthenticatedUser user = authenticatedUserService.getCurrentUser();
        return new UserResponse(user.getId(), user.getUsername(), user.getFullName(), user.getRole());
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getFullName(), user.getRole());
    }
}
