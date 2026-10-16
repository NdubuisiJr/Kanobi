import { describe, expect, it } from "vitest";
import { loginAction } from "./action";
import { formRequest } from "../test/utils";

describe("loginAction", () => {
  it("redirects to the projects page for valid credentials", async () => {
    const res = await loginAction({
      request: formRequest({ username: "admin", password: "password" }),
    });
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(302);
    expect((res as Response).headers.get("Location")).toBe("/project");
    expect(alert).not.toHaveBeenCalled();
  });

  it("alerts and stays put for invalid credentials", async () => {
    const res = await loginAction({
      request: formRequest({ username: "admin", password: "wrong" }),
    });
    expect(res).toBeUndefined();
    expect(alert).toHaveBeenCalledWith("Invalid credentials");
  });

  it("rejects a wrong username", async () => {
    await loginAction({ request: formRequest({ username: "x", password: "password" }) });
    expect(alert).toHaveBeenCalledWith("Invalid credentials");
  });
});
