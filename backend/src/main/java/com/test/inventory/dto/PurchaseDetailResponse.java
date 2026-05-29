package com.test.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PurchaseDetailResponse(
        Long purchaseId,
        String userFullName,
        BigDecimal totalAmount,
        String status,
        LocalDateTime createdAt,
        List<PurchaseDetailItemResponse> items
) {
}
