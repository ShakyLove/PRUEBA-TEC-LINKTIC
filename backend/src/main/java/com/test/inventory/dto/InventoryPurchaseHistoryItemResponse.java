package com.test.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InventoryPurchaseHistoryItemResponse(
        LocalDateTime createdAt,
        Integer quantity,
        BigDecimal total,
        String userFullName
) {
}
