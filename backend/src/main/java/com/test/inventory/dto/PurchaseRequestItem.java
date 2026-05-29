package com.test.inventory.dto;

public record PurchaseRequestItem(
        Long productId,
        Integer quantity
) {
}
