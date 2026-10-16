import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProjectDetails from "./ProjectDetails";
import { pending, renderWithRouter } from "../test/utils";

vi.mock("swagger-ui-react", () => ({
  default: () => <div data-testid="swagger-ui" />,
}));

const project = { id: "1", name: "Shop", description: "Online shop", models: [] };

const renderDetails = (data: Record<string, unknown>) =>
  renderWithRouter(
    [
      { path: "/project/:id", Component: ProjectDetails, loader: () => data },
      { path: "/elsewhere", loader: pending, element: null },
    ],
    ["/project/1"]
  );

describe("ProjectDetails", () => {
  it("shows the full deployment state", async () => {
    renderDetails({
      project,
      deployment: {
        deployedAt: "2026-01-02T00:00:00.000Z",
        buildStatus: "SUCCEEDED",
        currentPhase: "COMPLETED",
        isDeploying: true,
        log: "build log",
        swaggerJson: JSON.stringify({ openapi: "3.0.0" }),
      },
      bill: {
        currentCost: { currency: "USD", amount: "1.00" },
        projectedCost: { currency: "USD", amount: "3.00" },
      },
    });

    expect(await screen.findByRole("heading", { name: "Shop" })).toBeInTheDocument();
    expect(screen.getByText("Online shop")).toBeInTheDocument();
    expect(screen.getByText("Deployed At")).toBeInTheDocument();
    expect(
      screen.getByText(new Date("2026-01-02T00:00:00.000Z").toLocaleString())
    ).toBeInTheDocument();
    expect(screen.getByText("SUCCEEDED")).toHaveClass("text-green-600");
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    expect(screen.getByText("USD1.00")).toBeInTheDocument();
    expect(screen.getByText("USD3.00")).toBeInTheDocument();
    expect(screen.getByText("build log")).toBeInTheDocument();
    expect(screen.getByTestId("swagger-ui")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deploy changes" })).toBeDisabled();
  });

  it("marks a failed build in red", async () => {
    renderDetails({ project, deployment: { buildStatus: "FAILED" } });
    expect(await screen.findByText("FAILED")).toHaveClass("text-red-600");
  });

  it("renders a project that has never been deployed", async () => {
    renderDetails({ project });

    expect(await screen.findByRole("heading", { name: "Shop" })).toBeInTheDocument();
    expect(screen.queryByText("Build Status")).not.toBeInTheDocument();
    expect(screen.queryByText("Current Cost")).not.toBeInTheDocument();
    expect(screen.queryByTestId("swagger-ui")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deploy changes" })).toBeEnabled();
  });

  it("shows a loading screen while navigating", async () => {
    const { router } = renderDetails({ project });
    await screen.findByRole("heading", { name: "Shop" });

    router.navigate("/elsewhere");

    expect(await screen.findByText("Please wait...")).toBeInTheDocument();
  });
});
