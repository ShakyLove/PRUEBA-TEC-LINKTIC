import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ProductPurchaseForm from "../../src/components/products/ProductPurchaseForm.vue";

describe("ProductPurchaseForm", () => {
  it("muestra validacion cuando el stock es cero", () => {
    const wrapper = mount(ProductPurchaseForm, {
      props: {
        product: {
          id: 7,
          name: "Base Refrigerante Laptop",
          stock: 0,
          price: 95000
        }
      }
    });

    expect(wrapper.text()).toContain("No es posible comprar un producto sin stock.");
  });
});
