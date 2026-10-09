import "reflect-metadata";
import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, getPutOperators } from "./utils/dynamodbClient";
import { v4 as uuidv4 } from "uuid";
import { ResponseManager } from "./utils/responseManager";

export const ping = async (event: any) => {
  return {
    "Done_at: ": new Date(),
  };
};

export async function Getone(event: any): Promise<any> {
  try {
    async function includeRelatons(
      relations: any[],
      response: Record<string, any>
    ) {
      for (let relation of relations) {
        const id = response[`${relation.relatedModel}`];
        if (!id) continue;
        
        const type = relation.relationship.split("-to-")[0];
        if (type == "one") {
          const relResult = await docClient.send(
            new GetCommand({
              TableName: relation.tableName,
              Key: { id },
            })
          );

          if (relResult && relResult.Item) {
            response[`${relation.relatedModel}`] = relResult.Item;
          }
        } else {
          const keys = id.map((x) => {
            return {
              id: x,
            };
          });
          const requestItem = {};

          requestItem[relation.tableName] = {
            Keys: keys,
          };

          const command = new BatchGetCommand({
            RequestItems: requestItem,
          });

          const batchResponse = await docClient.send(command);
          if (batchResponse && batchResponse.Responses) {
            const results = batchResponse.Responses[relation.tableName] ?? [];
            response[`${relation.relatedModel}`] = results;
          }
        }
      }
    }

    const id = event.pathParameters?.id;

    const result = await docClient.send(
      new GetCommand({ TableName: process.env.TABLE_NAME, Key: { id } })
    );

    if (!result.Item) {
      return { statusCode: 404, body: "Item not found" };
    }

    const response = result.Item;

    const includes = event.queryStringParameters?.includes;
    if (includes) {
      let relations: any[] = [];
      if (includes == "true") {
        await includeRelatons(relations, response);
      } else {
        const models = includes.split(",");
        relations = relations.filter((x) => models.includes(x.relatedModel));
        await includeRelatons(relations, response);
      }
    }

    return ResponseManager.OkResponse(response);
  } catch (error) {
    return ResponseManager.InternalErrorResponse(
      process.env.FUNCTION_NAME,
      error
    );
  }
}

export async function Get(event: any): Promise<any> {
  try {
    const result = await docClient.send(
      new ScanCommand({ TableName: process.env.TABLE_NAME })
    );

    return ResponseManager.OkResponse(result.Items);
  } catch (error) {
    return ResponseManager.InternalErrorResponse(
      process.env.FUNCTION_NAME,
      error
    );
  }
}

export async function Post(event: any): Promise<any> {
  try {
    const body = JSON.parse(event.body || "{}") as Omit<any, "id">;

    const item = { id: uuidv4(), ...body };
    const requests: Promise<any>[] = [];

    if (body.includes) {
      let relations: any[] = [];
      for (let included of body.includes) {
        const relation = relations.find(
          (x) => x.relatedModel == included.model
        );
        if (!relation) continue;

        const relResult = await docClient.send(
          new GetCommand({
            TableName: relation.tableName,
            Key: { id: included.id },
          })
        );

        if (!relResult || !relResult.Item) continue;

        const relatedItem = relResult.Item;
        const relationshipTypes = relation.relationship.split("-to-");
        const mainItemType = relationshipTypes[0];
        const relatedItemType = relationshipTypes[1];

        if (mainItemType == "one") {
          item[`${relation.relatedModel}`] = included.id;
        } else {
          if (item[`${relation.relatedModel}`]) {
            item[`${relation.relatedModel}`] = [
              ...item[`${relation.relatedModel}`],
              included.id,
            ];
          } else {
            item[`${relation.relatedModel}`] = [included.id];
          }
        }

        if (relatedItemType == "one") {
          relatedItem[`${relation.mainModel}`] = item.id;
        } else {
          if (relatedItem[`${relation.mainModel}`]) {
            relatedItem[`${relation.mainModel}`] = [
              ...relatedItem[`${relation.mainModel}`],
              included.id,
            ];
          } else {
            relatedItem[`${relation.mainModel}`] = [included.id];
          }
        }

        const updateProp = {};
        updateProp[`${relation.mainModel}`] =
          relatedItem[`${relation.mainModel}`];

        const {
          updateExpression,
          expressionAttributeNames,
          expressionAttributeValues,
        } = getPutOperators(updateProp);

        requests.push(
          docClient.send(
            new UpdateCommand({
              TableName: relation.tableName,
              Key: { id: included.id },
              UpdateExpression: updateExpression,
              ExpressionAttributeNames: expressionAttributeNames,
              ExpressionAttributeValues: expressionAttributeValues,
            })
          )
        );
      }

      //@ts-ignore
      delete item.includes;
    }

    requests.push(
      docClient.send(
        new PutCommand({ TableName: process.env.TABLE_NAME, Item: item })
      )
    );

    await Promise.all(requests);

    return ResponseManager.CreatedResponse(item);
  } catch (error) {
    return ResponseManager.InternalErrorResponse(
      process.env.FUNCTION_NAME,
      error
    );
  }
}

export async function Put(event: any): Promise<any> {
  try {
    const id = event.pathParameters?.id;

    const result = await docClient.send(
      new GetCommand({ TableName: process.env.TABLE_NAME, Key: { id } })
    );

    if (!result.Item) {
      return { statusCode: 404, body: "Item not found" };
    }

    const body = JSON.parse(event.body || "{}");

    const requests: Promise<any>[] = [];
    if (body.includes) {
      let relations: any[] = [];
      for (let included of body.includes) {
        const relation = relations.find(
          (x) => x.relatedModel == included.model
        );
        if (!relation) continue;

        const relResult = await docClient.send(
          new GetCommand({
            TableName: relation.tableName,
            Key: { id: included.id },
          })
        );

        if (!relResult || !relResult.Item) continue;

        const relatedItem = relResult.Item;
        const relationshipTypes = relation.relationship.split("-to-");
        const mainItemType = relationshipTypes[0];
        const relatedItemType = relationshipTypes[1];

        if (mainItemType == "one") {
          body[`${relation.relatedModel}`] = included.id;
        } else {
          if (body[`${relation.relatedModel}`]) {
            body[`${relation.relatedModel}`] = [
              ...body[`${relation.relatedModel}`],
              included.id,
            ];
          } else {
            body[`${relation.relatedModel}`] = [included.id];
          }
        }

        if (relatedItemType == "one") {
          relatedItem[`${relation.mainModel}`] = id;
        } else {
          if (relatedItem[`${relation.mainModel}`]) {
            relatedItem[`${relation.mainModel}`] = [
              ...relatedItem[`${relation.mainModel}`],
              included.id,
            ];
          } else {
            relatedItem[`${relation.mainModel}`] = [included.id];
          }
        }

        const updateProp = {};
        updateProp[`${relation.mainModel}`] =
          relatedItem[`${relation.mainModel}`];

        const {
          updateExpression,
          expressionAttributeNames,
          expressionAttributeValues,
        } = getPutOperators(updateProp);

        requests.push(
          docClient.send(
            new UpdateCommand({
              TableName: relation.tableName,
              Key: { id: included.id },
              UpdateExpression: updateExpression,
              ExpressionAttributeNames: expressionAttributeNames,
              ExpressionAttributeValues: expressionAttributeValues,
            })
          )
        );
      }

      delete body.includes;
    }

    const {
      updateExpression,
      expressionAttributeNames,
      expressionAttributeValues,
    } = getPutOperators(body);
    requests.push(
      docClient.send(
        new UpdateCommand({
          TableName: process.env.TABLE_NAME,
          Key: { id },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        })
      )
    );

    await Promise.all(requests);

    return ResponseManager.NoContentResponse();
  } catch (error) {
    return ResponseManager.InternalErrorResponse(
      process.env.FUNCTION_NAME,
      error
    );
  }
}

export async function Delete(event: any): Promise<any> {
  try {
    const id = event.pathParameters?.id;

    await docClient.send(
      new DeleteCommand({ TableName: process.env.TABLE_NAME, Key: { id } })
    );

    return ResponseManager.NoContentResponse();
  } catch (error) {
    return ResponseManager.InternalErrorResponse(
      process.env.FUNCTION_NAME,
      error
    );
  }
}

export async function Postmultiple(event: any): Promise<any> {
  try {
    const data = [];
    const items = JSON.parse(event.body || "[]").map((item: any) => {
      const itemToSave = { id: uuidv4(), ...item };
      data.push(itemToSave);
      return {
        PutRequest: {
          Item: itemToSave,
        },
      };
    });

    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [process.env.TABLE_NAME!]: items,
        },
      })
    );

    return ResponseManager.CreatedResponse(data);
  } catch (error) {
    return ResponseManager.InternalErrorResponse(
      process.env.FUNCTION_NAME,
      error
    );
  }
}

export async function Deletemultiple(event: any): Promise<any> {
  try {
    const ids: string[] = event.pathParameters?.ids?.split(",");

    const deleteRequests = ids.map((id) => ({
      DeleteRequest: {
        Key: { id },
      },
    }));

    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [process.env.TABLE_NAME!]: deleteRequests,
        },
      })
    );

    return ResponseManager.NoContentResponse();
  } catch (error) {
    return ResponseManager.InternalErrorResponse(
      process.env.FUNCTION_NAME,
      error
    );
  }
}
