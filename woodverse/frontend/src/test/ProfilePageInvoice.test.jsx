import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfilePage } from "../pages/customer/ProfilePage";

const props = { isLoggedIn: true, role: "customer", onLogout: vi.fn() };

describe("ProfilePage invoice download", () => {
  let created;
  let revoked;
  let clicked;

  beforeEach(() => {
    localStorage.clear();
    created = [];
    revoked = [];
    URL.createObjectURL = vi.fn((blob) => {
      created.push(blob);
      return "blob:woodverse-invoice";
    });
    URL.revokeObjectURL = vi.fn((url) => revoked.push(url));
    clicked = [];
    // The anchor is created and clicked inside the page, so intercept the click instead
    // of letting jsdom try to navigate to the blob URL.
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function record() {
      clicked.push({ download: this.download, href: this.href });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("saves a readable invoice file instead of claiming a download happened", async () => {
    render(<ProfilePage {...props} />);
    fireEvent.click(screen.getAllByRole("button", { name: "View Details" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Download Invoice" }));

    expect(clicked).toHaveLength(1);
    expect(clicked[0].download).toBe("woodverse-invoice-WV-10482.txt");
    expect(clicked[0].href).toBe("blob:woodverse-invoice");

    const text = await created[0].text();
    expect(text).toContain("WOODVERSE INVOICE");
    expect(text).toContain("Invoice number: WV-10482");
    expect(text).toContain("Billed to: WoodVerse Customer");
    expect(text).toContain("Items");
    expect(revoked).toEqual(["blob:woodverse-invoice"]);
  });
});
