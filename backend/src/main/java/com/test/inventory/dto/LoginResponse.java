package com.test.inventory.dto;

public record LoginResponse(
        String token,
        String tokenType,
        UserResponse user
) {
}
