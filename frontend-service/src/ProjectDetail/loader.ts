import { redirect } from "react-router";

export const projectDetailLoader = async ({ params }: { params: any }) => {
  try {
    const { id } = params;
    const projectResponse = await fetch(
      `https://avw4j9bkn7.execute-api.eu-west-1.amazonaws.com/staging/project/${id}`
    );

    const project = (await projectResponse.json()).data;
    if (!project) {
      alert("Error fetching project");
      return redirect("/project");
    }

    // const projectCost = await fetch(
    //   `https://avw4j9bkn7.execute-api.eu-west-1.amazonaws.com/staging/project/cost/${id}`
    // );
    // const bill = (await projectCost.json()).data;

    const deploymentResponse = await fetch(
      `https://avw4j9bkn7.execute-api.eu-west-1.amazonaws.com/staging/deployment/${id}`
    );
    const deployment = (await deploymentResponse.json()).data;

    return { project, deployment };
  } catch (error: any) {
    alert(error.message);
  }
};
