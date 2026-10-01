import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SupplierVendorsPage } from "../pages/supplier/SupplierVendorsPage";

// The page opens a socket on mount, which has nothing to do with the filters.
vi.mock("socket.io-client", () => ({
  io: () => ({ on: vi.fn(), off: vi.fn(), emit: vi.fn(), disconnect: vi.fn(), connected: true }),
}));

const themeProps = { theme: "light", onToggleTheme: vi.fn() };

describe("SupplierVendorsPage filters", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("narrows the directory by supplier status", () => {
    render(<SupplierVendorsPage {...themeProps} />);
    expect(screen.getByRole("heading", { name: "Lanka Teak Estates" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "EcoGloss Finishes" })).toBeInTheDocument();

    // EcoGloss is the only Inactive supplier, so it drops out under Preferred.
    fireEvent.click(screen.getByRole("button", { name: "Preferred" }));
    expect(screen.queryByRole("heading", { name: "EcoGloss Finishes" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lanka Teak Estates" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByRole("heading", { name: "EcoGloss Finishes" })).toBeInTheDocument();
  });

  it("narrows the directory by material", () => {
    render(<SupplierVendorsPage {...themeProps} />);
    fireEvent.click(screen.getByRole("button", { name: "All Timber & Hardware" }));
    fireEvent.click(screen.getByRole("option", { name: "Varnish" }));

    expect(screen.getByRole("heading", { name: "EcoGloss Finishes" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Lanka Teak Estates" })).not.toBeInTheDocument();
  });

  it("shows the selected material on the trigger and closes the list", () => {
    render(<SupplierVendorsPage {...themeProps} />);
    fireEvent.click(screen.getByRole("button", { name: "All Timber & Hardware" }));
    fireEvent.click(screen.getByRole("option", { name: "Teak" }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Teak" })).toBeInTheDocument();
  });

  it("says so when a filter combination matches nothing", () => {
    render(<SupplierVendorsPage {...themeProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Active" }));
    fireEvent.click(screen.getByRole("button", { name: "All Regions" }));
    fireEvent.click(screen.getByRole("option", { name: "Galle" }));

    // The only Galle supplier is Preferred, so an Active filter leaves nothing.
    expect(screen.getByText("No suppliers match the current filters.")).toBeInTheDocument();
  });
});
