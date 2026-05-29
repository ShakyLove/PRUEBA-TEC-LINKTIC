package com.test.inventory.dto;

import java.util.List;

public record PurchaseRequest(
        Long productId,
        Integer quantity,
        List<PurchaseRequestItem> items
) {
}
