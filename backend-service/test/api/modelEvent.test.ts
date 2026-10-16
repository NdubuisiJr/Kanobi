import { beforeEach, describe, expect, it, vi } from "vitest";
import yaml from "js-yaml";
import { boilerplateYaml, indexTemplateText, PROJECT_ID, sourceFileOf, streamOf } from "../helpers";
import { ApiMethod } from "../../src/types";

const s3 = vi.hoisted(() => ({
  downloadFile: vi.fn(),
  getSource: vi.fn(),
  uploadFile: vi.fn(),
}));

vi.mock("../../src/utils/S3Client", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...s3,
}));

import {
  modelCreatedHandler,
  modelDeletedHandler,
  modelUpdatedHandler,
} from "../../src/api/model/modelEvent";

// getTableName lower-cases the model name and appends "sTable" + the id suffix.
const TABLE = "usersTable555555";
const INDEX_KEY = `${PROJECT_ID}/src/index.ts`;
const YAML_KEY = `${PROJECT_ID}/serverless.yml`;

const userModel = (apis = [{ method: ApiMethod.get, generate: true }]) =>
  ({
    id: "m1",
    name: "User",
    entityType: "Model",
    description: "",
    properties: [{ name: "email", type: "string", required: true }],
    apis,
  } as any);

const givenFiles = (yml: string, indexText = "// generated") => {
  s3.getSource.mockImplementation(async (key: string) =>
    sourceFileOf(key, key.endsWith("indexTemplate.ts") ? indexTemplateText : indexText)
  );
  s3.downloadFile.mockResolvedValue(streamOf(yml));
};

const uploaded = (key: string) =>
  s3.uploadFile.mock.calls.find(([k]) => k === key)![1] as string;
const uploadedYaml = (key = YAML_KEY) => yaml.load(uploaded(key)) as any;

beforeEach(() => {
  Object.values(s3).forEach((fn) => fn.mockReset());
  s3.uploadFile.mockResolvedValue({});
});

describe("modelCreatedHandler", () => {
  it("adds the handlers, table, env var and IAM statement to an empty service", async () => {
    givenFiles(boilerplateYaml);

    await expect(
      modelCreatedHandler({ projectId: PROJECT_ID, model: userModel() })
    ).resolves.toBe(true);

    const doc = uploadedYaml();
    expect(doc.functions.getUser.handler).toBe("dist/index.GetUser");
    expect(doc.resources.Resources[TABLE]).toMatchObject({
      Type: "AWS::DynamoDB::Table",
      Properties: { TableName: TABLE },
      Tags: [
        { Key: "Service", Value: "service-555555" },
        { Key: "Project", Value: PROJECT_ID },
      ],
    });
    expect(doc.provider.environment[TABLE.toUpperCase()]).toBe(TABLE);
    expect(doc.provider.iam.role.statements).toEqual([
      expect.objectContaining({
        Resource: [`arn:aws:dynamodb:eu-west-1:*:table/${TABLE}`],
      }),
    ]);
    expect(uploaded(INDEX_KEY)).toContain("export async function GetUser(");
  });

  it("appends to existing functions, resources and DynamoDB statements", async () => {
    givenFiles(
      yaml.dump({
        provider: {
          environment: {},
          iam: {
            role: {
              statements: [
                { Action: ["s3:GetObject"], Resource: ["arn:s3"] },
                { Action: ["dynamodb:PutItem"], Resource: ["arn:existing"] },
              ],
            },
          },
        },
        functions: { other: { handler: "x" } },
        resources: { Resources: { Existing: {} } },
      })
    );

    await modelCreatedHandler({ projectId: PROJECT_ID, model: userModel() });

    const doc = uploadedYaml();
    expect(Object.keys(doc.functions)).toEqual(["other", "getUser"]);
    expect(Object.keys(doc.resources.Resources)).toEqual(["Existing", TABLE]);
    expect(doc.provider.iam.role.statements[1].Resource).toEqual([
      "arn:existing",
      `arn:aws:dynamodb:eu-west-1:*:table/${TABLE}`,
    ]);
  });

  it("tolerates a missing project id", async () => {
    givenFiles(boilerplateYaml);

    await modelCreatedHandler({ projectId: undefined, model: userModel() });

    const doc = uploadedYaml("undefined/serverless.yml");
    expect(doc.functions.getUser.tags.Service).toBe("service-");
    expect(doc.provider.environment.USERSTABLE).toBe("usersTable");
  });

  it("logs and swallows errors", async () => {
    s3.getSource.mockRejectedValue(new Error("x"));
    await expect(
      modelCreatedHandler({ projectId: PROJECT_ID, model: userModel() })
    ).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});

describe("modelDeletedHandler", () => {
  it("removes the model's handlers, functions, table and env var", async () => {
    givenFiles(
      yaml.dump({
        provider: { environment: { [TABLE.toUpperCase()]: TABLE, KEEP: "1" } },
        functions: { getUser: {}, other: {} },
        resources: { Resources: { [TABLE]: {}, Existing: {} } },
      }),
      ["export async function GetUser() {}", "export async function Other() {}"].join("\n")
    );

    await modelDeletedHandler({ projectId: PROJECT_ID, model: userModel() });

    const doc = uploadedYaml();
    expect(doc.functions).toEqual({ other: {} });
    expect(doc.resources.Resources).toEqual({ Existing: {} });
    expect(doc.provider.environment).toEqual({ KEEP: "1" });
    expect(uploaded(INDEX_KEY)).not.toContain("GetUser");
    expect(uploaded(INDEX_KEY)).toContain("Other");
  });
});

describe("modelUpdatedHandler", () => {
  it("regenerates handlers and resources for every model", async () => {
    givenFiles(
      yaml.dump({
        provider: { environment: {} },
        functions: { getUser: {}, getoneUser: {} },
        resources: { Resources: { [TABLE]: { Tags: ["old"] } } },
      }),
      [
        "export async function GetUser() { return 'old'; }",
        "export async function GetoneUser() {}",
      ].join("\n")
    );

    await modelUpdatedHandler({
      projectId: PROJECT_ID,
      models: [
        userModel([
          { method: ApiMethod.get, generate: true },
          { method: ApiMethod.getone, generate: false },
        ]),
        { ...userModel(), name: "Post", apis: [{ method: ApiMethod.post, generate: true }] },
      ],
    });

    const doc = uploadedYaml();
    expect(Object.keys(doc.functions).sort()).toEqual(["getUser", "postPost"]);
    expect(doc.resources.Resources[TABLE]).toEqual({
      Type: "AWS::DynamoDB::Table",
      Properties: {
        TableName: TABLE,
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
      },
    });
    expect(doc.provider.environment).toEqual({
      [TABLE.toUpperCase()]: TABLE,
      POSTSTABLE555555: "postsTable555555",
    });

    const index = uploaded(INDEX_KEY);
    expect(index).not.toContain("return 'old'");
    expect(index).not.toContain("GetoneUser");
    expect(index).toContain("export async function GetUser(");
    expect(index).toContain("export async function PostPost(");
  });
});
