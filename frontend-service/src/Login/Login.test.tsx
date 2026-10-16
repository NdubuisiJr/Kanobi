import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Login from "./Login";
import { pending, renderWithRouter } from "../test/utils";

describe("Login", () => {
  it("renders the login form", () => {
    renderWithRouter([{ path: "/", Component: Login }]);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toHaveAttribute("name", "username");
    expect(screen.getByPlaceholderText("Password")).toHaveAttribute("type", "password");
  });

  it("submits credentials to the route action and shows a loading screen", async () => {
    let submitted: Record<string, FormDataEntryValue> = {};
    renderWithRouter([
      {
        path: "/",
        Component: Login,
        action: async ({ request }) => {
          submitted = Object.fromEntries(await request.formData());
          return pending();
        },
      },
    ]);

    await userEvent.type(screen.getByPlaceholderText("Username"), "admin");
    await userEvent.type(screen.getByPlaceholderText("Password"), "secret");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Please wait...")).toBeInTheDocument();
    expect(submitted).toEqual({ username: "admin", password: "secret" });
  });
});
