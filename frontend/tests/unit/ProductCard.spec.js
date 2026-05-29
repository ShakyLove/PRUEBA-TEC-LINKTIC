import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ProductCard from "../../src/components/products/ProductCard.vue";

describe("ProductCard", () => {
  it("renderiza los datos principales del producto", () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: {
          id: 1,
          name: "Laptop Lenovo IdeaPad 3",
          description: "Laptop de uso general con buen rendimiento.",
          category: "Tecnologia",
          price: 2450000,
          stock: 8,
          minimumStock: 2,
          imageUrl: "https://example.com/laptop.jpg"
        }
      },
      global: {
        stubs: {
          FontAwesomeIcon: true
        }
      }
    });

    expect(wrapper.text()).toContain("Laptop Lenovo IdeaPad 3");
    expect(wrapper.text()).toContain("Tecnologia");
    expect(wrapper.text()).toContain("Stock: 8");
  });
});
