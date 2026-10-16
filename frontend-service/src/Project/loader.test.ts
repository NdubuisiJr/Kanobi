import { describe, expect, it, vi } from "vitest";
import { projectsLoader } from "./loader";
import { API, jsonResponse, mockFetch } from "../test/utils";

describe("projectsLoader", () => {
  it("fetches the project list", async () => {
    const fetchMock = mockFetch(jsonResponse({ data: [{ id: "1" }] }));

    await expect(projectsLoader()).resolves.toEqual({
      projects: { data: [{ id: "1" }] },
    });
    expect(fetchMock).toHaveBeenCalledWith(`${API}/project`);
  });

  it("alerts when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(projectsLoader()).resolves.toBeUndefined();
    expect(alert).toHaveBeenCalledWith("offline");
  });
});
