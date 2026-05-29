package com.test.inventory.dto;

import java.math.BigDecimal;

public record PurchaseResponseItem(
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal,
        Integer remainingStock
) {
}
