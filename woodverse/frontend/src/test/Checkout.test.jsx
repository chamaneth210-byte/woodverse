import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { clearAuth, storeAuth } from "../utils";
import { PaymentPage } from "../pages/customer";

const IN_STOCK_PRODUCT = {
  id: "88888888-8888-4888-8888-888888888888",
  databaseId: "88888888-8888-4888-8888-888888888888",
  name: "Royal Majesty Set",
  vendor: "Lanka Teak Estates",
  price: 245000,
  stock: "In Stock",
  stockType: "in",
};

function signInCustomer() {
  const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, "");
  const token = [
    encode({ alg: "HS256" }),
    encode({ id: "11111111-1111-4111-8111-111111111111", role: "customer", exp: Math.floor(Date.now() / 1000) + 3600 }),
    "signature",
  ].join(".");
  storeAuth({ token, user: { id: "11111111-1111-4111-8111-111111111111", role: "customer" } });
}

function renderPayment(props = {}) {
  return render(
    <BrowserRouter>
      <PaymentPage cart={[IN_STOCK_PRODUCT]} catalogItems={[IN_STOCK_PRODUCT]} {...props} />
    </BrowserRouter>
  );
}

describe("PaymentPage checkout", () => {
  let setCart;

  beforeEach(() => {
    clearAuth();
    signInCustomer();
    setCart = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends only product ids and quantities, never a total or customer id", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      JSON.stringify({
        order: { id: "aaaaaaaa-1111-4111-8111-111111111111", total_amount: 256000 },
        requiresVendorApproval: false,
        pricing: { subtotal: 245000, delivery: 7500, assurance: 3500, total: 256000 },
      }),
      { status: 201, headers: { "content-type": "application/json" } }
    )));

    renderPayment({ setCart });

    fireEvent.click(screen.getByRole("button", { name: /Pay LKR/i }));

    await waitFor(() => expect(setCart).toHaveBeenCalledWith([]));
    const [, options] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.items).toEqual([{ id: IN_STOCK_PRODUCT.databaseId, quantity: 1 }]);
    // These are the fields that used to let the browser dictate the order.
    expect(body.totalAmount).toBeUndefined();
    expect(body.customerId).toBeUndefined();
    expect(body.customer).toBeUndefined();
    expect(body.items[0].price).toBeUndefined();
  });

  it("shows the order id the server returned", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      JSON.stringify({
        order: { id: "aaaaaaaa-1111-4111-8111-111111111111", total_amount: 256000 },
        requiresVendorApproval: false,
        pricing: { subtotal: 245000, delivery: 7500, assurance: 3500, total: 256000 },
      }),
      { status: 201, headers: { "content-type": "application/json" } }
    )));

    renderPayment({ setCart });
    fireEvent.click(screen.getByRole("button", { name: /Pay LKR/i }));

    await waitFor(() => {
      expect(screen.getByText(/aaaaaaaa-1111-4111-8111-111111111111 placed/)).toBeInTheDocument();
    });
  });

  it("surfaces an API failure instead of claiming success", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      JSON.stringify({ error: "PostgreSQL is not configured, so orders cannot be placed." }),
      { status: 503, headers: { "content-type": "application/json" } }
    )));

    renderPayment({ setCart });
    fireEvent.click(screen.getByRole("button", { name: /Pay LKR/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("PostgreSQL is not configured");
    });
    // No success notice, and the cart is not emptied.
    expect(document.querySelector(".border-emerald-200")).toBeNull();
    expect(setCart).not.toHaveBeenCalled();
  });

  it("does not invent a total for an empty cart", () => {
    renderPayment({ setCart, cart: [], catalogItems: [] });
    // The old code showed LKR 357,500 for an empty cart via a `|| 357500` fallback.
    expect(screen.getAllByText("LKR 0").length).toBeGreaterThan(0);
    expect(screen.queryByText(/357,500/)).not.toBeInTheDocument();
  });

  it("clears the cart only after the server confirms the order", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      JSON.stringify({
        order: { id: "aaaaaaaa-1111-4111-8111-111111111111", total_amount: 256000 },
        requiresVendorApproval: false,
        pricing: { subtotal: 245000, delivery: 7500, assurance: 3500, total: 256000 },
      }),
      { status: 201, headers: { "content-type": "application/json" } }
    )));

    renderPayment({ setCart });
    fireEvent.click(screen.getByRole("button", { name: /Pay LKR/i }));

    await waitFor(() => expect(setCart).toHaveBeenCalledWith([]));
  });

  it("does not write a fabricated order into localStorage", async () => {
    localStorage.removeItem("woodverse-vendor-orders");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      JSON.stringify({
        order: { id: "aaaaaaaa-1111-4111-8111-111111111111", total_amount: 256000 },
        requiresVendorApproval: false,
        pricing: { subtotal: 245000, delivery: 7500, assurance: 3500, total: 256000 },
      }),
      { status: 201, headers: { "content-type": "application/json" } }
    )));

    renderPayment({ setCart });
    fireEvent.click(screen.getByRole("button", { name: /Pay LKR/i }));

    await waitFor(() => expect(setCart).toHaveBeenCalled());
    // The vendor order list is loaded from GET /api/orders now, not from this key.
    expect(localStorage.getItem("woodverse-vendor-orders")).toBeNull();
  });
});
