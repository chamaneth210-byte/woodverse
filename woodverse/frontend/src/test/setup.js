import "@testing-library/jest-dom";

vi.mock("../components/CroppedImage", () => ({
  CroppedImage: () => {
    const React = require("react");
    return React.createElement("div", { "data-testid": "cropped-image" }, "[Image]");
  },
}));
