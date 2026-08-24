import { describe, it, expect } from "vitest";
import { products } from "../data/catalog";

describe("Catalog Data", () => {
  it("has 20 products", () => {
    expect(products.length).toBe(20);
  });

  it("all products have required fields", () => {
    products.forEach((product) => {
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.price).toBeGreaterThan(0);
      expect(["in", "low", "out"]).toContain(product.stockType);
    });
  });

  it("has at least one in-stock product", () => {
    const inStock = products.filter((p) => p.stockType === "in");
    expect(inStock.length).toBeGreaterThan(0);
  });

  it("has at least one out-of-stock product", () => {
    const outOfStock = products.filter((p) => p.stockType === "out");
    expect(outOfStock.length).toBeGreaterThan(0);
  });

  it("products have unique IDs", () => {
    const ids = products.map((p) => p.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  it("prices are positive integers", () => {
    products.forEach((product) => {
      expect(product.price).toBeGreaterThan(0);
      expect(Number.isInteger(product.price)).toBe(true);
    });
  });

  it("all products have valid vendors", () => {
    const validVendors = ["Moratuwa Crafts", "Ceylon Woods", "Urban Log", "Grand Timber"];
    products.forEach((product) => {
      expect(product.vendor).toBeDefined();
      expect(validVendors).toContain(product.vendor);
    });
  });

  it("all products have valid categories", () => {
    const validCategories = ["furniture", "gift"];
    products.forEach((product) => {
      expect(product.category).toBeDefined();
      expect(validCategories).toContain(product.category);
    });
  });

  it("all products have tags", () => {
    products.forEach((product) => {
      expect(Array.isArray(product.tags)).toBe(true);
      expect(product.tags.length).toBeGreaterThan(0);
    });
  });

  it("no product has customization fields", () => {
    products.forEach((product) => {
      expect(product).not.toHaveProperty("customizable");
      expect(product).not.toHaveProperty("customizationType");
    });
  });
});
