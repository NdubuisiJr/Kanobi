import { useLoaderData, useNavigation } from "react-router";
import InfoCard from "../components/InfoCard";
import ModelManager from "../components/modelManager";
import ConsoleOutput from "../components/ConsoleOutput";
import SwaggerViewer from "../components/SwaggerViewer";
import AutoRefresh from "../components/AutoRefresh";
import LoadingScreen from "../components/LoadingScreen";

export default function ProjectDetails() {
  const { project, deployment, bill } = useLoaderData();
  const navigation = useNavigation();

  return navigation.state == "loading" || navigation.state == "submitting" ? (
    <LoadingScreen />
  ) : (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
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
        {bill?.currentCost && (
          <InfoCard
            title="Current Cost"
            value={`${bill.currentCost.currency}${bill.currentCost.amount}`}
          />
        )}
        {bill?.projectedCost && (
          <InfoCard
            title="Projected Cost"
            value={`${bill.projectedCost.currency}${bill.projectedCost.amount}`}
          />
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
      {deployment?.isDeploying && <AutoRefresh interval={10000} />}
    </div>
  );
}
