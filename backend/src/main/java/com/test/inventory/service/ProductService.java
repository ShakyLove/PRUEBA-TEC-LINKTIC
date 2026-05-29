package com.test.inventory.service;

import com.test.inventory.dto.InventoryResponse;
import com.test.inventory.dto.InventoryPurchaseHistoryItemResponse;
import com.test.inventory.dto.PagedResponse;
import com.test.inventory.dto.ProductResponse;
import com.test.inventory.exception.ResourceNotFoundException;
import com.test.inventory.model.Product;
import com.test.inventory.model.PurchaseItem;
import com.test.inventory.repository.ProductRepository;
import com.test.inventory.repository.PurchaseItemRepository;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final PurchaseItemRepository purchaseItemRepository;

    public ProductService(ProductRepository productRepository, PurchaseItemRepository purchaseItemRepository) {
        this.productRepository = productRepository;
        this.purchaseItemRepository = purchaseItemRepository;
    }

    public PagedResponse<ProductResponse> getProducts(int page,
                                                      int size,
                                                      String search,
                                                      String category,
                                                      String sortBy,
                                                      String direction) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(size, 1),
                Sort.by(resolveDirection(direction), resolveSortBy(sortBy))
        );

        Specification<Product> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.isTrue(root.get("active")));

            if (search != null && !search.isBlank()) {
                String term = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), term),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), term)
                ));
            }

            if (category != null && !category.isBlank()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("category")),
                        category.trim().toLowerCase(Locale.ROOT)));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };

        Page<ProductResponse> responsePage = productRepository.findAll(specification, pageable).map(this::toResponse);
        return new PagedResponse<>(
                responsePage.getContent(),
                responsePage.getNumber(),
                responsePage.getSize(),
                responsePage.getTotalElements(),
                responsePage.getTotalPages(),
                responsePage.isLast()
        );
    }

    public ProductResponse getProductById(Long id) {
        Product product = getActiveProduct(id);
        return toResponse(product);
    }

    public InventoryResponse getInventory(Long id) {
        Product product = getActiveProduct(id);
        List<InventoryPurchaseHistoryItemResponse> recentPurchases = purchaseItemRepository
                .findTop5ByProductIdOrderByPurchaseCreatedAtDesc(id)
                .stream()
                .map(this::toInventoryHistoryItem)
                .toList();

        return new InventoryResponse(
                product.getId(),
                product.getName(),
                product.getCategory(),
                product.getImageUrl(),
                product.getStock(),
                product.getMinimumStock(),
                product.getStock() > 0,
                recentPurchases
        );
    }

    public Product getActiveProduct(Long productId) {
        return productRepository.findByIdAndActiveTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategory(),
                product.getPrice(),
                product.getStock(),
                product.getMinimumStock(),
                product.getImageUrl(),
                product.isActive(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    private InventoryPurchaseHistoryItemResponse toInventoryHistoryItem(PurchaseItem item) {
        return new InventoryPurchaseHistoryItemResponse(
                item.getPurchase().getCreatedAt(),
                item.getQuantity(),
                item.getSubtotal(),
                item.getPurchase().getUser().getFullName()
        );
    }

    private Sort.Direction resolveDirection(String direction) {
        return "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
    }

    private String resolveSortBy(String sortBy) {
        return switch (sortBy) {
            case "name", "category", "price", "stock", "createdAt" -> sortBy;
            default -> "id";
        };
    }
}
