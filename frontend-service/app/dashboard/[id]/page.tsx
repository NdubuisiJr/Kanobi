import AutoRefresh from "../../../components/AutoRefresh";
import ConsoleOutput from "../../../components/ConsoleOutput";
import InfoCard from "../../../components/InfoCard";
import ModelManager from "../../../components/modelManager";
import SwaggerViewer from "../../../components/SwaggerViewer";

export default async function ProjectDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectResponse = await fetch(
    `https://avw4j9bkn7.execute-api.eu-west-1.amazonaws.com/staging/project/${id}`,
    {
      next: { revalidate: 0 },
    }
  );
  const project = (await projectResponse.json()).data;
  if (!project) return <div className="p-8">Project not found</div>;

  const deploymentResponse = await fetch(
    `https://avw4j9bkn7.execute-api.eu-west-1.amazonaws.com/staging/deployment/${id}`,
    {
      next: { revalidate: 0 },
    }
  );
  const deployment = (await deploymentResponse.json()).data;
  return (
    <div className="min-h-screen p-8 bg-gray-900">
      <div className="flex-row mx-auto w-max mb-10">
        <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
        <p className="mb-2">{project.description}</p>
      </div>
      <div className="flex justify-center">
        {deployment?.deployedAt && (
          <InfoCard
            title="Deployed At"
            value={new Date(deployment?.deployedAt).toLocaleString()}
          />
        )}
        {deployment?.buildStatus && (
          <InfoCard
            title="Build Status"
            value={deployment?.buildStatus}
            valueClassName={
              deployment?.buildStatus === "SUCCEEDED"
                ? "text-green-600"
                : "text-red-600"
            }
          />
        )}
        {deployment?.currentPhase && (
          <InfoCard title="Build Phase" value={deployment?.currentPhase} />
        )}
      </div>
      <div className="my-4">
        <ModelManager project={project} isDeploying={deployment?.isDeploying} />
      </div>
      {deployment?.log && (
        <div className="my-4">
          <ConsoleOutput logs={deployment?.log} />
        </div>
      )}
      {deployment?.swaggerJson && (
        <div className="my-4">
          <SwaggerViewer spec={JSON.parse(deployment?.swaggerJson)} />
        </div>
      )}
      {deployment?.isDeploying && <AutoRefresh interval={3000} />}
    </div>
  );
}
