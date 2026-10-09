import { z } from "zod";

export type AppData = {
  projectName: string;
  models: AppModel[];
};

export type Property = {
  name: string;
  type: string;
  required: boolean;
};

export type ApiProperty = {
  method: ApiMethod;
  generate: boolean;
};

export type AppModel = {
  name: string;
  properties: Property[];
  apis: ApiProperty[];
  relations: Relationship[];
};

export type ApplicationEvent<T> = {
  type: string;
  payload: T;
};

export enum ApiMethod {
  getone = "getone",
  get = "get",
  post = "post",
  put = "put",
  delete = "delete",
  postmultiple = "postmultiple",
  deletemultiple = "deletemultiple",
}

export const ApiSettingsSchema = z.object({
  method: z.string().refine(
    (prop) => {
      return Object.values(ApiMethod).includes(prop as ApiMethod);
    },
    { message: `method must be one of ${Object.values(ApiMethod)}` }
  ),
  generate: z.boolean(),
});

export type ApiSettings = {
  method: string;
  path: string;
  summary: string;
  hasParam: boolean;
  hasBody: boolean;
  hasResponse: boolean;
  paramName: string;
  responseType: "array" | "object";
  bodyType: "array" | "object";
};

export type ConnectModel = {
  model: string;
  id?: string;
  data?: any;
};

export type Relationship = {
  modelId: string;
  mainModel: string;
  relatedModel: string;
  relationship: string;
  tableName: string;
};
