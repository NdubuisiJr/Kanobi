import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ConsoleOutput from "./ConsoleOutput";
import Dialog from "./Dialog";
import InfoCard from "./InfoCard";
import LoadingScreen from "./LoadingScreen";
import AutoRefresh from "./AutoRefresh";
import { renderWithRouter } from "../test/utils";

describe("LoadingScreen", () => {
  it("shows a wait message", () => {
    render(<LoadingScreen />);
    expect(screen.getByText("Please wait...")).toBeInTheDocument();
  });
});

describe("InfoCard", () => {
  it("renders title and value with the default colour", () => {
    render(<InfoCard title="Status" value="OK" />);
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("OK")).toHaveClass("text-gray-400");
  });

  it("applies a custom value class", () => {
    render(<InfoCard title="Status" value="OK" valueClassName="text-green-600" />);
    expect(screen.getByText("OK")).toHaveClass("text-green-600");
    expect(screen.getByText("OK")).not.toHaveClass("text-gray-400");
  });
});

describe("Dialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Dialog isOpen={false} onClose={() => {}}>
        body
      </Dialog>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders title and children and closes from the ✕ button", () => {
    const onClose = vi.fn();
    render(
      <Dialog isOpen onClose={onClose} title="Hello">
        body
      </Dialog>
    );

    expect(screen.getByRole("heading", { name: "Hello" })).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "✕" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("omits the heading without a title", () => {
    render(
      <Dialog isOpen onClose={() => {}}>
        body
      </Dialog>
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});

describe("ConsoleOutput", () => {
  it("shows logs and toggles open and closed", () => {
    render(<ConsoleOutput logs="build ok" />);

    expect(screen.getByText("build ok")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Click to collapse"));
    expect(screen.queryByText("build ok")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Click to expand"));
    expect(screen.getByText("build ok")).toBeInTheDocument();
  });
});

describe("AutoRefresh", () => {
  afterEach(() => vi.useRealTimers());

  const renderAutoRefresh = (element: React.ReactElement) => {
    const loader = vi.fn(() => null);
    renderWithRouter([{ path: "/", loader, element }]);
    return loader;
  };

  it("revalidates route data on an interval until unmounted", async () => {
    vi.useFakeTimers();
    const loader = renderAutoRefresh(<AutoRefresh interval={1000} />);
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(loader).toHaveBeenCalledTimes(1);

    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(loader).toHaveBeenCalledTimes(3);
  });

  it("defaults to a five second interval", async () => {
    vi.useFakeTimers();
    const loader = renderAutoRefresh(<AutoRefresh />);
    // Let the initial load settle so the component mounts at t=0.
    await act(() => vi.advanceTimersByTimeAsync(0));
    await act(() => vi.advanceTimersByTimeAsync(4999));
    expect(loader).toHaveBeenCalledTimes(1);

    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(loader).toHaveBeenCalledTimes(2);
  });
});
