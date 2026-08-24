import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

import App from "../App";

describe("App Integration", () => {
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

  it("renders cart page", async () => {
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

  it("does not render customization routes", async () => {
    window.history.pushState({}, "Test page", "/customize/cane-lounge-chair");
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText(/Customize Your/)).not.toBeInTheDocument();
    });
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
