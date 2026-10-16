import { describe, expect, it, vi } from "vitest";
import { projectAction } from "./action";
import { API, formRequest, jsonResponse, mockFetch } from "../test/utils";

describe("projectAction", () => {
  it("creates a project", async () => {
    const fetchMock = mockFetch(jsonResponse({ data: { id: "1" } }, 201));

    const res = await projectAction({
      request: formRequest({ action: "post", name: "Shop", description: "d" }),
    });

    expect(res).toEqual({ success: true, data: { data: { id: "1" } } });
    expect(fetchMock).toHaveBeenCalledWith(`${API}/project`, {
      method: "POST",
      body: JSON.stringify({ name: "Shop", description: "d" }),
    });
  });

  it("deletes a project", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 204 }));

    const res = await projectAction({
      request: formRequest({ action: "delete", projectId: "1" }),
    });

    expect(res).toEqual({ success: true, data: 204 });
    expect(fetchMock).toHaveBeenCalledWith(`${API}/project/1`, { method: "DELETE" });
  });

  it("updates a project", async () => {
    const fetchMock = mockFetch(jsonResponse({}, 200));

    const res = await projectAction({
      request: formRequest({ action: "put", id: "1", name: "New", description: "d2" }),
    });

    expect(res).toEqual({ success: true, data: 200 });
    expect(fetchMock).toHaveBeenCalledWith(`${API}/project/1`, {
      method: "PUT",
      body: JSON.stringify({ name: "New", description: "d2" }),
    });
  });

  it("ignores unknown actions", async () => {
    const fetchMock = mockFetch(jsonResponse({}));
    await expect(projectAction({ request: formRequest({}) })).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("alerts on network errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(
      projectAction({ request: formRequest({ action: "post", name: "Shop" }) })
    ).resolves.toBeUndefined();
    expect(alert).toHaveBeenCalledWith("offline");
  });
});
