package com.test.inventory.dto;

public record UserResponse(
        Long id,
        String username,
        String fullName,
        String role
) {
}
