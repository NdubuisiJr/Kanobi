import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SwaggerViewer from "./SwaggerViewer";

vi.mock("swagger-ui-react", () => ({
  default: ({ spec }: { spec: { info: { title: string } } }) => (
    <div data-testid="swagger-ui">{spec.info.title}</div>
  ),
}));

describe("SwaggerViewer", () => {
  it("renders the spec and toggles it", () => {
    render(<SwaggerViewer spec={{ info: { title: "Shop API" } }} />);

    expect(screen.getByTestId("swagger-ui")).toHaveTextContent("Shop API");
    fireEvent.click(screen.getByText("Click to collapse"));
    expect(screen.queryByTestId("swagger-ui")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Click to expand"));
    expect(screen.getByTestId("swagger-ui")).toBeInTheDocument();
  });
});
