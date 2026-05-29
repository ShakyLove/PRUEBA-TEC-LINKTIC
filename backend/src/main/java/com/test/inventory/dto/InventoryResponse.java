package com.test.inventory.dto;

import java.util.List;

public record InventoryResponse(
        Long productId,
        String productName,
        String category,
        String imageUrl,
        Integer availableQuantity,
        Integer minimumStock,
        boolean available,
        List<InventoryPurchaseHistoryItemResponse> recentPurchases
) {
}
