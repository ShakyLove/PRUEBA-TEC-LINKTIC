package com.test.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PurchaseSummaryResponse(
        Long purchaseId,
        String userFullName,
        Integer itemCount,
        BigDecimal totalAmount,
        String status,
        LocalDateTime createdAt
) {
}
