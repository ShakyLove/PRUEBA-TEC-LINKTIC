package com.test.inventory.service;

import com.test.inventory.config.AuthenticatedUser;
import com.test.inventory.dto.PagedResponse;
import com.test.inventory.dto.PurchaseDetailItemResponse;
import com.test.inventory.dto.PurchaseDetailResponse;
import com.test.inventory.dto.PurchaseRequest;
import com.test.inventory.dto.PurchaseRequestItem;
import com.test.inventory.dto.PurchaseResponse;
import com.test.inventory.dto.PurchaseResponseItem;
import com.test.inventory.dto.PurchaseSummaryResponse;
import com.test.inventory.exception.BusinessException;
import com.test.inventory.exception.ResourceNotFoundException;
import com.test.inventory.model.Product;
import com.test.inventory.model.Purchase;
import com.test.inventory.model.PurchaseItem;
import com.test.inventory.model.User;
import com.test.inventory.repository.ProductRepository;
import com.test.inventory.repository.PurchaseRepository;
import com.test.inventory.repository.UserRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final AuthenticatedUserService authenticatedUserService;

    public PurchaseService(PurchaseRepository purchaseRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository,
                           ProductService productService,
                           AuthenticatedUserService authenticatedUserService) {
        this.purchaseRepository = purchaseRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productService = productService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @Transactional
    public PurchaseResponse createPurchase(PurchaseRequest request) {
        AuthenticatedUser currentUser = authenticatedUserService.getCurrentUser();
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<PurchaseRequestItem> requestItems = normalizeRequestItems(request);

        Purchase purchase = Purchase.builder()
                .user(user)
                .totalAmount(BigDecimal.ZERO)
                .status("COMPLETED")
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<PurchaseResponseItem> responseItems = new ArrayList<>();

        for (PurchaseRequestItem requestItem : requestItems) {
            Product product = productService.getActiveProduct(requestItem.productId());

            if (product.getStock() < requestItem.quantity()) {
                throw new BusinessException("Stock insuficiente para realizar la compra", HttpStatus.CONFLICT);
            }

            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(requestItem.quantity()));

            PurchaseItem item = PurchaseItem.builder()
                    .product(product)
                    .quantity(requestItem.quantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();
            purchase.addItem(item);

            product.setStock(product.getStock() - requestItem.quantity());
            productRepository.save(product);

            totalAmount = totalAmount.add(subtotal);
            responseItems.add(new PurchaseResponseItem(
                    product.getId(),
                    product.getName(),
                    requestItem.quantity(),
                    unitPrice,
                    subtotal,
                    product.getStock()
            ));
        }

        purchase.setTotalAmount(totalAmount);
        Purchase savedPurchase = purchaseRepository.save(purchase);

        return new PurchaseResponse(
                savedPurchase.getId(),
                totalAmount,
                savedPurchase.getStatus(),
                responseItems,
                "Compra realizada exitosamente"
        );
    }

    @Transactional(readOnly = true)
    public PagedResponse<PurchaseSummaryResponse> getPurchases(int page, int size) {
        AuthenticatedUser currentUser = authenticatedUserService.getCurrentUser();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        Page<PurchaseSummaryResponse> responsePage = purchaseRepository
                .findByUser_IdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(this::toSummaryResponse);

        return new PagedResponse<>(
                responsePage.getContent(),
                responsePage.getNumber(),
                responsePage.getSize(),
                responsePage.getTotalElements(),
                responsePage.getTotalPages(),
                responsePage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public PurchaseDetailResponse getPurchaseById(Long purchaseId) {
        AuthenticatedUser currentUser = authenticatedUserService.getCurrentUser();
        Purchase purchase = purchaseRepository.findByIdAndUser_Id(purchaseId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada"));

        List<PurchaseDetailItemResponse> items = purchase.getItems()
                .stream()
                .map(item -> new PurchaseDetailItemResponse(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getImageUrl(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ))
                .toList();

        return new PurchaseDetailResponse(
                purchase.getId(),
                purchase.getUser().getFullName(),
                purchase.getTotalAmount(),
                purchase.getStatus(),
                purchase.getCreatedAt(),
                items
        );
    }

    private PurchaseSummaryResponse toSummaryResponse(Purchase purchase) {
        return new PurchaseSummaryResponse(
                purchase.getId(),
                purchase.getUser().getFullName(),
                purchase.getItems() == null ? 0 : purchase.getItems().size(),
                purchase.getTotalAmount(),
                purchase.getStatus(),
                purchase.getCreatedAt()
        );
    }

    private List<PurchaseRequestItem> normalizeRequestItems(PurchaseRequest request) {
        List<PurchaseRequestItem> rawItems;

        if (request.items() != null && !request.items().isEmpty()) {
            rawItems = request.items();
        } else if (request.productId() != null || request.quantity() != null) {
            rawItems = List.of(new PurchaseRequestItem(request.productId(), request.quantity()));
        } else {
            throw new BusinessException("Debe enviar al menos un producto para la compra", HttpStatus.UNPROCESSABLE_ENTITY);
        }

        Map<Long, Integer> mergedItems = new LinkedHashMap<>();

        for (PurchaseRequestItem item : rawItems) {
            if (item == null || item.productId() == null) {
                throw new BusinessException("El productId es obligatorio", HttpStatus.UNPROCESSABLE_ENTITY);
            }
            if (item.quantity() == null) {
                throw new BusinessException("La cantidad es obligatoria", HttpStatus.UNPROCESSABLE_ENTITY);
            }
            if (item.quantity() <= 0) {
                throw new BusinessException("La cantidad debe ser mayor a cero", HttpStatus.UNPROCESSABLE_ENTITY);
            }

            mergedItems.merge(item.productId(), item.quantity(), Integer::sum);
        }

        return mergedItems.entrySet()
                .stream()
                .map(entry -> new PurchaseRequestItem(entry.getKey(), entry.getValue()))
                .toList();
    }
}
