package com.test.inventory.dto;

import java.math.BigDecimal;

public record PurchaseDetailItemResponse(
        Long productId,
        String productName,
        String imageUrl,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
}
