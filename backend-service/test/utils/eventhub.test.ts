import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { handled, invoke, configUpdate } = vi.hoisted(() => ({
  handled: [] as Array<{ name: string; payload: unknown }>,
  invoke: vi.fn(),
  configUpdate: vi.fn(),
}));

// Real handler modules do S3/codegen work; replace them with named recorders
// (LambdaEventHub derives Lambda function names from `handler.name`).
vi.mock("../../src/api/project/projectEvent", () => ({
  PROJECT_CREATED: "project created",
  PROJECT_DELETED: "project deleted",
  projectCreatedHandler: async function projectCreatedHandler(payload: unknown) {
    handled.push({ name: "projectCreatedHandler", payload });
    return "created";
  },
  projectDeletedHandler: async function projectDeletedHandler(payload: unknown) {
    handled.push({ name: "projectDeletedHandler", payload });
  },
}));

vi.mock("../../src/api/model/modelEvent", () => ({
  MODEL_CREATED: "model created",
  MODEL_DELETED: "model deleted",
  MODEL_UPDATED: "model upated",
  modelCreatedHandler: async function modelCreatedHandler(payload: unknown) {
    handled.push({ name: "modelCreatedHandler", payload });
  },
  modelDeletedHandler: async function modelDeletedHandler(payload: unknown) {
    handled.push({ name: "modelDeletedHandler", payload });
  },
  modelUpdatedHandler: async function modelUpdatedHandler() {
    throw new Error("update failed");
  },
}));

vi.mock("../../src/api/deployment/deploymentEvent", () => ({
  DEPLOYMENT_TRIGGERED: "deployment triggered",
  deploymentTriggeredHandler: async function deploymentTriggeredHandler(
    payload: unknown
  ) {
    handled.push({ name: "deploymentTriggeredHandler", payload });
  },
}));

vi.mock("aws-sdk", () => ({
  config: { update: configUpdate },
  Lambda: class {
    invoke = invoke;
  },
}));

import { EventHub, LambdaEventHub, LocalEventHub } from "../../src/utils/eventhub";

beforeEach(() => {
  handled.length = 0;
  invoke.mockReset();
  configUpdate.mockReset();
});

describe("EventHub.Get", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses the in-process hub in dev", () => {
    vi.stubEnv("NODE_ENV", "dev");
    expect(EventHub.Get()).toBeInstanceOf(LocalEventHub);
  });

  it("uses the Lambda hub elsewhere", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(EventHub.Get()).toBeInstanceOf(LambdaEventHub);
  });
});

describe("LocalEventHub", () => {
  const hub = new LocalEventHub();

  it.each([
    ["project created", "projectCreatedHandler"],
    ["project deleted", "projectDeletedHandler"],
    ["model created", "modelCreatedHandler"],
    ["model deleted", "modelDeletedHandler"],
    ["deployment triggered", "deploymentTriggeredHandler"],
  ])("routes '%s' to %s", async (type, name) => {
    await hub.publish({ type, payload: { id: 1 } });
    expect(handled).toEqual([{ name, payload: { id: 1 } }]);
  });

  it("resolves with the handler's result", async () => {
    await expect(
      hub.publish({ type: "project created", payload: {} })
    ).resolves.toBe("created");
  });

  it("echoes the payload for the default empty event", async () => {
    await expect(hub.publish({ type: "", payload: "ping" })).resolves.toBe("ping");
  });

  it("rejects unknown events", async () => {
    await expect(hub.publish({ type: "nope", payload: {} })).rejects.toBe(
      "nope Event handler not found"
    );
  });

  it("rejects with the event type when the handler throws", async () => {
    await expect(
      hub.publish({ type: "model upated", payload: {} })
    ).rejects.toBe("model upated Error: update failed");
  });
});

describe("LambdaEventHub", () => {
  const hub = new LambdaEventHub();

  it.each([
    ["project created", "projectCreatedHandler"],
    ["project deleted", "projectDeletedHandler"],
    ["model created", "modelCreatedHandler"],
    ["model deleted", "modelDeletedHandler"],
    ["model upated", "modelUpdatedHandler"],
    ["deployment triggered", "deploymentTriggeredHandler"],
  ])("invokes the Lambda for '%s' asynchronously", async (type, name) => {
    invoke.mockReturnValue({ promise: () => Promise.resolve({}) });

    await expect(hub.publish({ type, payload: { id: 1 } })).resolves.toBe(true);

    expect(configUpdate).toHaveBeenCalledWith({
      region: "eu-west-1",
      accessKeyId: "test-key",
      secretAccessKey: "test-secret",
    });
    expect(invoke).toHaveBeenCalledWith({
      FunctionName: `project-kanobi-test-${name}`,
      Payload: JSON.stringify({ id: 1 }),
      InvocationType: "Event",
    });
  });

  it("returns true when FunctionError is null", async () => {
    invoke.mockReturnValue({ promise: () => Promise.resolve({ FunctionError: null }) });
    await expect(hub.publish({ type: "", payload: {} })).resolves.toBe(true);
    expect(invoke.mock.calls[0][0].FunctionName).toBe("test-function-name");
  });

  it("returns false when the invocation reports a FunctionError", async () => {
    invoke.mockReturnValue({
      promise: () => Promise.resolve({ FunctionError: "Unhandled" }),
    });
    await expect(hub.publish({ type: "project created", payload: {} })).resolves.toBe(
      false
    );
  });

  it("throws for unknown events", async () => {
    await expect(hub.publish({ type: "nope", payload: {} })).rejects.toBe(
      "nope Event handler not found"
    );
    expect(invoke).not.toHaveBeenCalled();
  });
});
