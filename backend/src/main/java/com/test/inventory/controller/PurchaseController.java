package com.test.inventory.controller;

import com.test.inventory.dto.PagedResponse;
import com.test.inventory.dto.PurchaseDetailResponse;
import com.test.inventory.dto.PurchaseRequest;
import com.test.inventory.dto.PurchaseResponse;
import com.test.inventory.dto.PurchaseSummaryResponse;
import com.test.inventory.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PostMapping
    public ResponseEntity<PurchaseResponse> createPurchase(@Valid @RequestBody PurchaseRequest request) {
        return ResponseEntity.ok(purchaseService.createPurchase(request));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<PurchaseSummaryResponse>> getPurchases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(purchaseService.getPurchases(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseDetailResponse> getPurchase(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.getPurchaseById(id));
    }
}
