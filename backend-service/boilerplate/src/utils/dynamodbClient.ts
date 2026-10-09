import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_DEPLOY_REGION,
});

export const docClient = DynamoDBDocumentClient.from(client);

export const getPutOperators = (body: any) => {
  const keys = Object.keys(body);
  const updateExpression = "set " + keys.map((x) => `#${x} = :${x}`).join(", ");
  const expressionAttributeNames: any = {};
  const expressionAttributeValues: any = {};

  for (let key of keys) {
    expressionAttributeNames["#" + key] = key;
    expressionAttributeValues[":" + key] = body[key];
  }

  return {
    updateExpression,
    expressionAttributeNames,
    expressionAttributeValues,
  };
};
