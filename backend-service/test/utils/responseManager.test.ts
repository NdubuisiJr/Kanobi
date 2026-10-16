import { describe, expect, it } from "vitest";
import { ResponseManager } from "../../src/utils/responseManager";
import { parseBody } from "../helpers";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
};

describe("ResponseManager", () => {
  it("OkResponse uses defaults", () => {
    const res = ResponseManager.OkResponse({ a: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.headers).toEqual(corsHeaders);
    expect(parseBody(res)).toEqual({ data: { a: 1 }, message: "ok", meta: {} });
  });

  it("OkResponse accepts meta and message", () => {
    const res = ResponseManager.OkResponse([1], { count: 1 }, "fine");
    expect(parseBody(res)).toEqual({ data: [1], message: "fine", meta: { count: 1 } });
  });

  it("CreatedResponse", () => {
    expect(ResponseManager.CreatedResponse("x").statusCode).toBe(201);
    expect(parseBody(ResponseManager.CreatedResponse("x"))).toEqual({
      data: "x",
      message: "created",
      meta: {},
    });
    expect(
      parseBody(ResponseManager.CreatedResponse("x", { m: 1 }, "made"))
    ).toEqual({ data: "x", message: "made", meta: { m: 1 } });
  });

  it("NoContentResponse has no body", () => {
    const res = ResponseManager.NoContentResponse();
    expect(res).toEqual({ statusCode: 204, headers: corsHeaders });
  });

  it("NotfoundResponse", () => {
    expect(parseBody(ResponseManager.NotfoundResponse())).toEqual({
      message: "Not found",
    });
    const res = ResponseManager.NotfoundResponse("gone");
    expect(res.statusCode).toBe(404);
    expect(parseBody(res)).toEqual({ message: "gone" });
  });

  it("AuthFailedResponse", () => {
    expect(parseBody(ResponseManager.AuthFailedResponse())).toEqual({
      message: "Auth failed",
    });
    const res = ResponseManager.AuthFailedResponse("nope");
    expect(res.statusCode).toBe(401);
    expect(parseBody(res)).toEqual({ message: "nope" });
  });

  it("BadRequestResponse", () => {
    expect(parseBody(ResponseManager.BadRequestResponse("bad"))).toEqual({
      data: "bad",
      message: "Bad request",
    });
    const res = ResponseManager.BadRequestResponse(["e"], "invalid");
    expect(res.statusCode).toBe(400);
    expect(parseBody(res)).toEqual({ data: ["e"], message: "invalid" });
  });

  it("InternalErrorResponse logs the error", () => {
    const err = new Error("boom");
    const res = ResponseManager.InternalErrorResponse("fn", err);
    expect(res.statusCode).toBe(500);
    expect(parseBody(res)).toEqual({ message: "An unexpected error occured!" });
    expect(console.error).toHaveBeenCalledWith(
      expect.any(String),
      "[ERROR]: ",
      "FN",
      err
    );
    expect(
      parseBody(ResponseManager.InternalErrorResponse("fn", err, "custom"))
    ).toEqual({ message: "custom" });
  });
});
