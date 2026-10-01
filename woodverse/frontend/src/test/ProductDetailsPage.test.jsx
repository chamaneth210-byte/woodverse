import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ProductDetailsPage } from "../pages/customer/index";
import { getRestockAlerts } from "../lib/wishlist";

describe("ProductDetailsPage", () => {
  const mockProduct = {
    id: "cane-lounge-chair",
    name: "Cane Lounge Chair",
    vendor: "Urban Log",
    description: "A relaxed lounge chair combining a hardwood frame, cane back, and washable cushion seat.",
    price: 126500,
    stock: "In Stock",
    stockType: "in",
    tags: ["Cane", "Fabric"],
    image: "/assets/living-room-hero.png",
    category: "furniture",
    room: "Living",
    featured: 14,
  };

  it("renders product not found when product is null", () => {
    render(
      <BrowserRouter>
        <ProductDetailsPage product={null} />
      </BrowserRouter>
    );
    expect(screen.getByText("Product not found")).toBeInTheDocument();
    expect(screen.getByText("Back to Shop")).toBeInTheDocument();
  });

  it("renders product details when product is provided", () => {
    render(
      <BrowserRouter>
        <ProductDetailsPage product={mockProduct} />
      </BrowserRouter>
    );
    expect(screen.getByRole("heading", { name: /Cane Lounge Chair/i })).toBeInTheDocument();
    expect(screen.getByText(/Vendor: Urban Log/)).toBeInTheDocument();
    expect(screen.getByText(/126,500/)).toBeInTheDocument();
  });

  it("does not render Customize button", () => {
    render(
      <BrowserRouter>
        <ProductDetailsPage product={mockProduct} />
      </BrowserRouter>
    );
    expect(screen.queryByText("Customize")).not.toBeInTheDocument();
  });

  it("renders Add to Cart button for in-stock product", () => {
    render(
      <BrowserRouter>
        <ProductDetailsPage product={mockProduct} addToCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText("Add to Cart")).toBeInTheDocument();
  });

  it("renders product description", () => {
    render(
      <BrowserRouter>
        <ProductDetailsPage product={mockProduct} />
      </BrowserRouter>
    );
    expect(screen.getByText(/relaxed lounge chair/i)).toBeInTheDocument();
  });

  it("renders product tags", () => {
    render(
      <BrowserRouter>
        <ProductDetailsPage product={mockProduct} />
      </BrowserRouter>
    );
    expect(screen.getAllByText("Cane").length).toBeGreaterThan(0);
    expect(screen.getByText("Fabric")).toBeInTheDocument();
  });

  it("calls addToCart when Add to Cart is clicked", () => {
    const mockAdd = vi.fn();
    render(
      <BrowserRouter>
        <ProductDetailsPage product={mockProduct} addToCart={mockAdd} />
      </BrowserRouter>
    );
    const addButton = screen.getByText("Add to Cart");
    fireEvent.click(addButton);
    expect(mockAdd).toHaveBeenCalledWith(mockProduct);
  });
});

describe("ProductDetailsPage back-in-stock alert", () => {
  const soldOut = {
    id: "cane-lounge-chair",
    name: "Cane Lounge Chair",
    vendor: "Urban Log",
    description: "A relaxed lounge chair combining a hardwood frame, cane back, and washable cushion seat.",
    price: 126500,
    stock: "Out of Stock",
    stockType: "out",
    stockQuantity: 0,
    tags: ["Cane", "Fabric"],
    image: "/assets/living-room-hero.png",
    category: "furniture",
    room: "Living",
    featured: 14,
  };

  beforeEach(() => localStorage.clear());

  it("stores a restock alert and reflects it in the button", () => {
    const mockAdd = vi.fn();
    render(
      <BrowserRouter>
        <ProductDetailsPage product={soldOut} addToCart={mockAdd} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Notify Me" }));

    expect(getRestockAlerts().map((item) => item.id)).toEqual(["cane-lounge-chair"]);
    // A sold-out product must not fall through to the cart.
    expect(mockAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Alert Set" })).toBeInTheDocument();
  });
});
