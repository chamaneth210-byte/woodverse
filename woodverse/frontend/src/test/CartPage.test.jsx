import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { CartPage } from "../pages/customer/index";

describe("CartPage", () => {
  const mockCart = [
    {
      id: "cane-lounge-chair",
      name: "Cane Lounge Chair",
      vendor: "Urban Log",
      price: 126500,
      stockType: "in",
      quantity: 1,
    },
    {
      id: "mahogany-coffee-table",
      name: "Mahogany Coffee Table",
      vendor: "Ceylon Woods",
      price: 89000,
      stockType: "low",
      quantity: 2,
    },
  ];

  it("renders cart items", () => {
    render(
      <BrowserRouter>
        <CartPage cart={mockCart} setCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText("Cane Lounge Chair")).toBeInTheDocument();
    expect(screen.getByText("Mahogany Coffee Table")).toBeInTheDocument();
  });

  it("displays item quantities", () => {
    render(
      <BrowserRouter>
        <CartPage cart={mockCart} setCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("displays vendor names", () => {
    render(
      <BrowserRouter>
        <CartPage cart={mockCart} setCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText(/Vendor: Urban Log/)).toBeInTheDocument();
    expect(screen.getByText(/Vendor: Ceylon Woods/)).toBeInTheDocument();
  });

  it("renders Clear Cart button", () => {
    render(
      <BrowserRouter>
        <CartPage cart={mockCart} setCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText("Clear Cart")).toBeInTheDocument();
  });

  it("renders Proceed to Checkout button", () => {
    render(
      <BrowserRouter>
        <CartPage cart={mockCart} setCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText("Proceed to Checkout")).toBeInTheDocument();
  });
});
