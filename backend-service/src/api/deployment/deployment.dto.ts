import { z } from "zod";

export const TriggerDeploymentDtoSchema = z.object({
  projectId: z.string(),
});

export const DeploymentSchema = z.object({
  pk: z.string(),
  sk: z.string(),
  entityType: z.string(),
  deployedAt: z.string().optional(),
  triggeredAt: z.string(),
  isDeploying: z.boolean(),
  buildStatus: z.string().optional(),
  buildId: z.string().optional(),
  currentPhase: z.string().optional(),
  buildComplete: z.boolean().optional(),
  baseUrl: z.string().optional(),
  apiId: z.string().optional(),
});

export const DeploymentResponseSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  entityType: z.string(),
  deployedAt: z.date().optional(),
  triggeredAt: z.date(),
  isDeploying: z.boolean(),
  log: z.string().optional(),
  buildStatus: z.string().optional(),
  buildId: z.string().optional(),
  currentPhase: z.string().optional(),
  buildComplete: z.boolean().optional(),
  baseUrl: z.string().optional(),
  apiId: z.string().optional(),
  swaggerJson: z.string().optional(),
});

export type TriggerDeploymentDto = z.infer<typeof TriggerDeploymentDtoSchema>;
export type DeploymentModel = z.infer<typeof DeploymentSchema>;
export type DeploymentResponseDto = z.infer<typeof DeploymentResponseSchema>;
