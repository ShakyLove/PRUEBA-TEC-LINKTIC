package com.test.inventory.dto;

import java.math.BigDecimal;
import java.util.List;

public record PurchaseResponse(
        Long purchaseId,
        BigDecimal totalAmount,
        String status,
        List<PurchaseResponseItem> items,
        String message
) {
}
