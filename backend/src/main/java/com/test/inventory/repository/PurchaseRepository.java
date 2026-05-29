package com.test.inventory.repository;

import com.test.inventory.model.Purchase;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    Page<Purchase> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<Purchase> findByIdAndUser_Id(Long id, Long userId);
}
