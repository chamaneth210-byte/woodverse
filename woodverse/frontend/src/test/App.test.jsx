import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { clearAuth, getSession, storeAuth } from "../utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

import App from "../App";

// Portal pages are code split, so the first test to open one also pays for loading and
// transforming its chunk. The default 1s wait is not enough for that.
const PORTAL_TIMEOUT = { timeout: 20000 };

// A token whose payload is a customer, so protected pages have something to accept.
function signInCustomer() {
  const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, "");
  const token = [
    encode({ alg: "HS256", typ: "JWT" }),
    encode({ id: "11111111-1111-4111-8111-111111111111", role: "customer", email: "a@example.com", exp: Math.floor(Date.now() / 1000) + 3600 }),
    "signature",
  ].join(".");
  storeAuth({ token, user: { id: "11111111-1111-4111-8111-111111111111", role: "customer", email: "a@example.com" } });
  return token;
}

// A token whose payload is an admin, which is the only role the ERP console allows.
function signInAdmin() {
  const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, "");
  const token = [
    encode({ alg: "HS256", typ: "JWT" }),
    encode({ id: "33333333-3333-4333-8333-333333333333", role: "admin", email: "admin@woodverse.lk", exp: Math.floor(Date.now() / 1000) + 3600 }),
    "signature",
  ].join(".");
  storeAuth({ token, user: { id: "33333333-3333-4333-8333-333333333333", role: "admin", email: "admin@woodverse.lk" } });
  return token;
}

// A token whose payload is a supplier, which is the role the supplier portal allows.
function signInSupplier() {
  const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, "");
  const token = [
    encode({ alg: "HS256", typ: "JWT" }),
    encode({ id: "22222222-2222-4222-8222-222222222222", role: "supplier", email: "ops@lumbinitimber.lk", exp: Math.floor(Date.now() / 1000) + 3600 }),
    "signature",
  ].join(".");
  storeAuth({ token, user: { id: "22222222-2222-4222-8222-222222222222", role: "supplier", email: "ops@lumbinitimber.lk" } });
  return token;
}

describe("Admin portal routes", () => {
  // Each console section is its own address so it can be linked and bookmarked. The
  // sections share one shell, which reads the section off the path.
  const adminRoutes = [
    ["/admin", "Overview Dashboard"],
    ["/admin/customers", "Customers"],
    ["/admin/vendors", "Vendors"],
    ["/admin/suppliers", "Suppliers"],
    ["/admin/products", "Products"],
    ["/admin/orders", "Orders"],
    ["/admin/categories", "Categories"],
    ["/admin/payments", "Payments"],
    ["/admin/settings", "System Settings"],
    ["/admin/profile", "Admin Profile"],
  ];

  beforeEach(() => {
    clearAuth();
    signInAdmin();
  });

  it.each(adminRoutes)("opens the console section at %s", async (path, heading) => {
    window.history.pushState({}, "Test page", path);
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // The console header and the section body both carry the section name, so this only
// asserts that the section rendered. The deep link test below pins down which one.
await waitFor(() => {
      expect(screen.getAllByRole("heading", { name: heading }).length).toBeGreaterThan(0);
    }, PORTAL_TIMEOUT);
    expect(window.location.pathname).toBe(path);
  });

  it("shows the section for a deep link on first load, not the dashboard", async () => {
    window.history.pushState({}, "Test page", "/admin/orders");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getAllByRole("heading", { name: "Orders" }).length).toBeGreaterThan(0);
    }, PORTAL_TIMEOUT);
    // The console header must follow the URL instead of staying on the dashboard title.
    expect(screen.queryByRole("heading", { name: "Overview Dashboard" })).not.toBeInTheDocument();
  });

  it("moves the URL when a sidebar section is clicked", async () => {
    window.history.pushState({}, "Test page", "/admin");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Overview Dashboard" })).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole("button", { name: "Payments" }));
    await waitFor(() => {
      expect(window.location.pathname).toBe("/admin/payments");
      expect(screen.getAllByRole("heading", { name: "Payments" }).length).toBeGreaterThan(0);
    }, PORTAL_TIMEOUT);
  });

  it("does not open a console section for a customer", async () => {
    clearAuth();
    signInCustomer();
    window.history.pushState({}, "Test page", "/admin/orders");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
    expect(screen.queryByRole("heading", { name: "Orders" })).not.toBeInTheDocument();
  });
});

describe("App Integration", () => {
  beforeEach(() => {
    clearAuth();
    window.history.pushState({}, "Test page", "/");
  });

  it("renders home page by default", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText("Build better woodcraft, together.")).toBeInTheDocument();
  });

  it("renders shop page", async () => {
    window.history.pushState({}, "Test page", "/shop");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Explore All WoodVerse Collections")).toBeInTheDocument();
    });
  });

  it("renders furniture page", async () => {
    window.history.pushState({}, "Test page", "/furniture");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Furniture for Dining, Rest, Living, and Work")).toBeInTheDocument();
    });
  });

  it("does not render the cart page for an anonymous visitor", async () => {
    window.history.pushState({}, "Test page", "/cart");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
    });
    expect(screen.queryByText("Your Cart")).not.toBeInTheDocument();
  });

  it("renders cart page for a signed in customer", async () => {
    signInCustomer();
    window.history.pushState({}, "Test page", "/cart");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Your Cart")).toBeInTheDocument();
    });
  });

  it("does not render the admin dashboard for a customer", async () => {
    signInCustomer();
    window.history.pushState({}, "Test page", "/admin");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(window.location.pathname).not.toBe("/admin");
    });
  });

  it("does not render the vendor dashboard for an anonymous visitor", async () => {
    window.history.pushState({}, "Test page", "/vendor-dashboard");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(window.location.pathname).toContain("/login");
    });
  });

  it("does not treat a leftover auth flag as a session", async () => {
    // The old code trusted this string, so any visitor could claim to be signed in.
    localStorage.setItem("woodverse-authenticated", "true");
    window.history.pushState({}, "Test page", "/cart");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
    });
  });

  it("treats a malformed token as signed out", async () => {
    localStorage.setItem("woodverse-auth-token", "not-a-jwt");
    window.history.pushState({}, "Test page", "/cart");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
    });
    expect(localStorage.getItem("woodverse-auth-token")).toBeNull();
  });

  it("treats an expired token as signed out", async () => {
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, "");
    localStorage.setItem(
      "woodverse-auth-token",
      [
        encode({ alg: "HS256" }),
        encode({ id: "11111111-1111-4111-8111-111111111111", role: "admin", exp: Math.floor(Date.now() / 1000) - 10 }),
        "signature",
      ].join(".")
    );
    window.history.pushState({}, "Test page", "/admin");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
    });
    // Even an admin claim is dropped once the token has expired.
    expect(localStorage.getItem("woodverse-auth-token")).toBeNull();
  });

  it("renders login page", async () => {
    window.history.pushState({}, "Test page", "/login");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });
  });
});

describe("Supplier portal routes", () => {
  // Every URL the sidebar links to used to fall through to the storefront home page,
  // because only /supplier/profile was registered in the route map.
  const supplierRoutes = [
    ["/supplier", "Here's your operational overview for today, October 24th."],
    ["/supplier/purchase-orders", "Order PO-8921"],
    ["/supplier/purchase-orders/po-8921", "Order PO-8921"],
    ["/supplier/materials", "Timber Inventory"],
    ["/supplier/shipments", "Shipment Management"],
    ["/supplier/shipments/new", "New Shipment"],
    ["/supplier/vendors", "Vendor Directory"],
    ["/supplier/notifications", "Notifications"],
    ["/supplier/profile", "Supplier Profile"],
    ["/supplier/apps", "Apps"],
    ["/supplier/support", "Support Center"],
    ["/supplier/settings", "Settings"],
  ];

  beforeEach(() => {
    clearAuth();
    signInSupplier();
  });

  it.each(supplierRoutes)("renders %s instead of the storefront", async (path, heading) => {
    window.history.pushState({}, "Test page", path);
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
    }, PORTAL_TIMEOUT);
    expect(screen.queryByText("Build better woodcraft, together.")).not.toBeInTheDocument();
    expect(window.location.pathname).toBe(path);
  });

  it("sends an anonymous visitor to the login page instead of the dashboard", async () => {
    clearAuth();
    window.history.pushState({}, "Test page", "/supplier/materials");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(window.location.pathname).toContain("/login");
    });
  });

  it("does not open a supplier page for a customer", async () => {
    clearAuth();
    signInCustomer();
    window.history.pushState({}, "Test page", "/supplier/vendors");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
    expect(screen.queryByText("Vendor Directory")).not.toBeInTheDocument();
  });

  // Guards the whole sign-in to dashboard path: the guard must not bounce a supplier who
  // has just authenticated. Note this asserts the flow, not the commit ordering that caused
  // the original bounce. That ordering depends on how the browser batches the popstate
  // dispatched inside navigate(), and jsdom commits both updates together, so the old
  // guard passed here too. Keep this test as the flow check, not as proof of that race.
  it("lands on the dashboard after signing in, without bouncing back to login", async () => {
    clearAuth();
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, "");
    const token = [
      encode({ alg: "HS256", typ: "JWT" }),
      encode({ id: "22222222-2222-4222-8222-222222222222", role: "supplier", email: "ops@lumbinitimber.lk", exp: Math.floor(Date.now() / 1000) + 3600 }),
      "signature",
    ].join(".");

    // A fresh Response per call: a body can only be read once, and App also fetches
    // /api/catalog on mount.
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/api/auth/login")) {
        return new Response(JSON.stringify({ token, user: { id: "22222222-2222-4222-8222-222222222222", role: "supplier", email: "ops@lumbinitimber.lk" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ products: [] }), { status: 200, headers: { "content-type": "application/json" } });
    });

    window.history.pushState({}, "Test page", "/login");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText("Email Address"), "ops@lumbinitimber.lk");
    // Exact, because the reveal toggle is labelled "Show password".
    await userEvent.type(screen.getByLabelText("Password", { exact: true }), "Supplier@123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/supplier");
    }, PORTAL_TIMEOUT);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Here's your operational overview for today, October 24th." })).toBeInTheDocument();
    }, PORTAL_TIMEOUT);
    expect(window.location.pathname).not.toContain("/login");
  });
});

describe("Portal sign out", () => {
  // The portals render their own shell, so the storefront logout button was not
  // reachable from them and the admin console button only printed a notice.
  const portals = [
    ["/vendor-dashboard", "vendor", "Log out"],
    ["/supplier", "supplier", "Log out"],
    ["/admin", "admin", "Logout"],
  ];

  const signIn = (role) => {
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, "");
    const token = [
      encode({ alg: "HS256", typ: "JWT" }),
      encode({ id: "44444444-4444-4444-8444-444444444444", role, exp: Math.floor(Date.now() / 1000) + 3600 }),
      "signature",
    ].join(".");
    storeAuth({ token, user: { id: "44444444-4444-4444-8444-444444444444", role } });
  };

  beforeEach(() => clearAuth());

  it.each(portals)("signs out from %s", async (path, role, label) => {
    signIn(role);
    window.history.pushState({}, "Test page", path);
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: label }).length).toBeGreaterThan(0);
    }, PORTAL_TIMEOUT);
    await userEvent.click(screen.getAllByRole("button", { name: label })[0]);
    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
    expect(getSession()).toBeNull();
  });

  it("drops the cached session so a protected page cannot be opened afterwards", async () => {
    signIn("vendor");
    window.history.pushState({}, "Test page", "/vendor-dashboard");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
    }, PORTAL_TIMEOUT);
    await userEvent.click(screen.getByRole("button", { name: "Log out" }));
    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
    // Cart accepts a vendor session, so this only stays blocked while the guard in App
    // still holds the token that sign out just removed.
    window.history.pushState({}, "Test page", "/cart");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await waitFor(() => {
      expect(window.location.pathname).toContain("/login");
    });
  });
});
