package com.test.inventory.repository;

import com.test.inventory.model.PurchaseItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, Long> {

    List<PurchaseItem> findTop5ByProductIdOrderByPurchaseCreatedAtDesc(Long productId);
}
