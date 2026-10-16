import { describe, expect, it } from "vitest";
import { logError, logInfo, logWarning } from "../../src/utils/logger";

describe("logger", () => {
  it("logInfo writes to console.log with an upper-cased function name", () => {
    logInfo("myFn", "hello");
    expect(console.log).toHaveBeenCalledWith(
      expect.any(String),
      "[INFO]: ",
      "MYFN",
      "hello"
    );
  });

  it("logError writes to console.error", () => {
    logError("myFn", "boom");
    expect(console.error).toHaveBeenCalledWith(
      expect.any(String),
      "[ERROR]: ",
      "MYFN",
      "boom"
    );
  });

  it("logWarning writes to console.warn", () => {
    logWarning("myFn", "careful");
    expect(console.warn).toHaveBeenCalledWith(
      expect.any(String),
      "[ERROR]: ",
      "MYFN",
      "careful"
    );
  });

  it("tolerates a missing function name", () => {
    logInfo(undefined as unknown as string, "x");
    logError(undefined as unknown as string, "x");
    logWarning(undefined as unknown as string, "x");
    expect(console.log).toHaveBeenCalledWith(
      expect.any(String),
      "[INFO]: ",
      undefined,
      "x"
    );
  });
});
