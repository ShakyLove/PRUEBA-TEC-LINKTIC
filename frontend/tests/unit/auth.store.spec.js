import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "../../src/stores/auth.store";

vi.mock("../../src/services/auth.service", () => ({
  authService: {
    login: vi.fn()
  }
}));

vi.mock("../../src/utils/storage", () => ({
  persistSession: vi.fn(),
  getToken: vi.fn(() => ""),
  getUser: vi.fn(() => null),
  clearSession: vi.fn()
}));

describe("auth.store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("guarda token y usuario cuando el login es exitoso", async () => {
    const { authService } = await import("../../src/services/auth.service");
    authService.login.mockResolvedValue({
      data: {
        token: "jwt-demo",
        user: {
          id: 1,
          username: "admin",
          fullName: "Administrador del Sistema",
          role: "ADMIN"
        }
      }
    });

    const store = useAuthStore();
    await store.login({ username: "admin", password: "admin123" });

    expect(store.token).toBe("jwt-demo");
    expect(store.user.fullName).toBe("Administrador del Sistema");
    expect(store.isAuthenticated).toBe(true);
  });
});
