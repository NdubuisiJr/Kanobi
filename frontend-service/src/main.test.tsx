import { describe, expect, it, vi } from "vitest";
import { createRoot } from "react-dom/client";

const { render } = vi.hoisted(() => ({ render: vi.fn() }));

vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({ render })),
}));
vi.mock("swagger-ui-react", () => ({ default: () => null }));

describe("main", () => {
  it("mounts the router into #root", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import("./main");

    expect(createRoot).toHaveBeenCalledWith(document.getElementById("root"));
    expect(render).toHaveBeenCalledTimes(1);
  });
});
