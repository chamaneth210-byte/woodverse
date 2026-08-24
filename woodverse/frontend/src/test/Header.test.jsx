import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Header } from "../components/Header";

const mockProps = {
  path: "/",
  theme: "dark",
  onToggleTheme: () => {},
  cartCount: 0,
  isLoggedIn: false,
};

describe("Header", () => {
  it("renders navigation links", () => {
    render(
      <BrowserRouter>
        <Header {...mockProps} />
      </BrowserRouter>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Shop")).toBeInTheDocument();
    expect(screen.getByText("Furniture")).toBeInTheDocument();
    expect(screen.getByText("Wooden gifts")).toBeInTheDocument();
  });

  it("does not render Customize link", () => {
    render(
      <BrowserRouter>
        <Header {...mockProps} />
      </BrowserRouter>
    );
    expect(screen.queryByText("Customize")).not.toBeInTheDocument();
  });

  it("toggles theme when theme button is clicked", () => {
    const mockToggle = vi.fn();
    render(
      <BrowserRouter>
        <Header {...mockProps} onToggleTheme={mockToggle} />
      </BrowserRouter>
    );
    const themeBtn = screen.getByLabelText("Switch to light mode");
    fireEvent.click(themeBtn);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("displays cart count", () => {
    render(
      <BrowserRouter>
        <Header {...mockProps} cartCount={3} />
      </BrowserRouter>
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
