import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";

const mockProduct = {
  id: "cane-lounge-chair",
  name: "Cane Lounge Chair",
  vendor: "Urban Log",
  price: 126500,
  stock: "In Stock",
  stockType: "in",
  stockQuantity: 8,
  description: "A relaxed lounge chair combining a hardwood frame, cane back, and washable cushion seat.",
  tags: ["Cane", "Fabric"],
  image: "/assets/living-room-hero.png",
  category: "furniture",
  room: "Living",
  featured: 14,
};

describe("ProductCard", () => {
  it("renders product name and vendor", () => {
    render(<ProductCard product={mockProduct} onAdd={() => {}} />);
    expect(screen.getByRole("heading", { name: /Cane Lounge Chair/i })).toBeInTheDocument();
    expect(screen.getByText(/Vendor: Urban Log/)).toBeInTheDocument();
  });

  it("renders product price", () => {
    render(<ProductCard product={mockProduct} onAdd={() => {}} />);
    expect(screen.getByText(/126,500/)).toBeInTheDocument();
  });

  it("renders stock badge for in-stock product", () => {
    render(<ProductCard product={mockProduct} onAdd={() => {}} />);
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("does not render Customizable badge", () => {
    render(<ProductCard product={mockProduct} onAdd={() => {}} />);
    expect(screen.queryByText("Customizable")).not.toBeInTheDocument();
  });

  it("does not render customize button", () => {
    render(<ProductCard product={mockProduct} onAdd={() => {}} />);
    expect(screen.queryByLabelText(/Customize/)).not.toBeInTheDocument();
  });

  it("calls onAdd when add-to-cart button is clicked", () => {
    const mockAdd = vi.fn();
    render(<ProductCard product={mockProduct} onAdd={mockAdd} />);
    const addButton = screen.getByLabelText("Add Cane Lounge Chair to cart");
    fireEvent.click(addButton);
    expect(mockAdd).toHaveBeenCalledWith(mockProduct);
  });

  it("renders product tags", () => {
    render(<ProductCard product={mockProduct} onAdd={() => {}} />);
    expect(screen.getByText("Cane")).toBeInTheDocument();
    expect(screen.getByText("Fabric")).toBeInTheDocument();
  });
});
