import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HomePage } from "../pages/customer/index";

describe("HomePage", () => {
  it("renders hero section", () => {
    render(
      <BrowserRouter>
        <HomePage addToCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText("Build better woodcraft, together.")).toBeInTheDocument();
  });

  it("renders navigation links in hero", () => {
    render(
      <BrowserRouter>
        <HomePage addToCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getAllByText("Get Started").length).toBeGreaterThan(0);
    expect(screen.getByText("Learn More")).toBeInTheDocument();
  });

  it("does not render Customize Furniture button", () => {
    render(
      <BrowserRouter>
        <HomePage addToCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.queryByText("Customize Furniture")).not.toBeInTheDocument();
  });

  it("renders stats section", () => {
    render(
      <BrowserRouter>
        <HomePage addToCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getAllByText("2,400+").length).toBeGreaterThan(0);
    expect(screen.getAllByText("184").length).toBeGreaterThan(0);
    expect(screen.getAllByText("42").length).toBeGreaterThan(0);
  });

  it("renders FAQ section", () => {
    render(
      <BrowserRouter>
        <HomePage addToCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText("What is WoodVerse?")).toBeInTheDocument();
  });

  it("renders pricing plans", () => {
    render(
      <BrowserRouter>
        <HomePage addToCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("renders contact section", () => {
    render(
      <BrowserRouter>
        <HomePage addToCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText("hello@woodverse.lk")).toBeInTheDocument();
    expect(screen.getByText("+94 11 245 8891")).toBeInTheDocument();
  });

  it("renders footer", () => {
    render(
      <BrowserRouter>
        <HomePage addToCart={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getAllByText(/WoodVerse/).length).toBeGreaterThan(0);
  });
});
