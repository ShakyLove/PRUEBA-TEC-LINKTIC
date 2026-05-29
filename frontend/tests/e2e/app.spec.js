import { expect, test } from "@playwright/test";

const user = {
  id: 1,
  username: "admin",
  fullName: "Administrador del Sistema",
  role: "ADMIN"
};

const product = {
  id: 1,
  name: "Laptop Lenovo IdeaPad 3",
  description: "Laptop de uso general con buen rendimiento para oficina y navegacion.",
  category: "Tecnologia",
  price: 2450000,
  stock: 4,
  minimumStock: 2,
  imageUrl: "https://example.com/laptop.jpg",
  active: true,
  createdAt: "2026-05-28T10:00:00",
  updatedAt: "2026-05-28T10:00:00"
};

async function mockAuthenticatedApp(page, purchaseMode = "success") {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ json: user });
  });

  await page.route(/\/api\/products\/\d+\/inventory(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: {
        productId: product.id,
        productName: product.name,
        category: product.category,
        imageUrl: product.imageUrl,
        availableQuantity: product.stock,
        minimumStock: product.minimumStock,
        available: true,
        recentPurchases: [
          {
            createdAt: "2026-05-28T20:21:00",
            quantity: 2,
            total: 4900000,
            userFullName: "Administrador"
          }
        ]
      }
    });
  });

  await page.route(/\/api\/products(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: {
        content: [product],
        page: 0,
        size: Number(new URL(route.request().url()).searchParams.get("size") || 8),
        totalElements: 1,
        totalPages: 1,
        last: true
      }
    });
  });

  await page.route(/\/api\/products\/1(?:\?.*)?$/, async (route) => {
    await route.fulfill({ json: product });
  });

  await page.route("**/api/purchases?page=0&size=50", async (route) => {
    await route.fulfill({
      json: {
        content: [
          {
            purchaseId: 10,
            createdAt: "2026-05-28T20:21:00",
            userFullName: "Administrador",
            itemCount: 1,
            totalAmount: 4900000,
            status: "COMPLETED"
          }
        ],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
        last: true
      }
    });
  });

  await page.route("**/api/purchases/10", async (route) => {
    await route.fulfill({
      json: {
        purchaseId: 10,
        createdAt: "2026-05-28T20:21:00",
        userFullName: "Administrador",
        totalAmount: 4900000,
        status: "COMPLETED",
        items: [
          {
            productId: 1,
            productName: product.name,
            imageUrl: product.imageUrl,
            quantity: 2,
            unitPrice: 2450000,
            subtotal: 4900000
          }
        ]
      }
    });
  });

  await page.route("**/api/purchases", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    if (purchaseMode === "success") {
      await route.fulfill({
        json: {
          purchaseId: 11,
          totalAmount: 2450000,
          status: "COMPLETED"
        }
      });
      return;
    }

    await route.fulfill({
      status: 409,
      json: {
        status: 409,
        message: "Stock insuficiente para realizar la compra"
      }
    });
  });
}

async function openAuthenticatedRoute(page, path) {
  await page.goto("/login");
  await page.evaluate((seedUser) => {
    window.localStorage.setItem("inventory_token", "jwt-demo");
    window.localStorage.setItem("inventory_user", JSON.stringify(seedUser));
  }, user);
  await page.goto(path);
}

test("listar, detalle, compra", async ({ page }) => {
  await mockAuthenticatedApp(page, "success");

  await openAuthenticatedRoute(page, "/products");
  await expect(page).toHaveURL(/products/);
  await expect(page.getByText("Laptop Lenovo IdeaPad 3")).toBeVisible();

  await page.getByRole("button", { name: "Ver detalle" }).click();
  await expect(page).toHaveURL(/products\/1/);
  await expect(page.getByRole("heading", { name: "Laptop Lenovo IdeaPad 3" })).toBeVisible();

  await page.goto("/purchases/new");
  await expect(page).toHaveURL(/purchases\/new/);

  await page.getByRole("button", { name: "Agregar" }).click();
  await page.getByRole("button", { name: "Confirmar compra" }).click();

  await expect(page.getByText(/Compra realizada con exito/i)).toBeVisible();
});

test("error en compra", async ({ page }) => {
  await mockAuthenticatedApp(page, "error");

  await openAuthenticatedRoute(page, "/purchases/new");
  await expect(page).toHaveURL(/purchases\/new/);

  await page.getByRole("button", { name: "Agregar" }).click();
  await page.getByRole("button", { name: "Confirmar compra" }).click();

  await expect(page.getByText("Error al procesar la compra")).toBeVisible();
  await expect(page.getByText("Request failed with status code 409")).toBeVisible();
});
