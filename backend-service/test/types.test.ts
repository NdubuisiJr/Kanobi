import { describe, expect, it } from "vitest";
import { ApiMethod, ApiSettingsSchema } from "../src/types";

describe("ApiSettingsSchema", () => {
  it.each(Object.values(ApiMethod))("accepts the %s method", (method) => {
    expect(ApiSettingsSchema.safeParse({ method, generate: true }).success).toBe(true);
  });

  it("rejects unknown methods", () => {
    const result = ApiSettingsSchema.safeParse({ method: "patch", generate: true });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "method must be one of getone,get,post,put,delete,postmultiple,deletemultiple"
    );
  });
});
