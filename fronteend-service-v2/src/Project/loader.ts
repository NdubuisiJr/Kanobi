export const projectsLoader = async () => {
  try {
    const response = await fetch(
      "https://avw4j9bkn7.execute-api.eu-west-1.amazonaws.com/staging/project"
    );

    const projects = await response.json();

    return { projects };
  } catch (error: any) {
    alert(error.message);
  }
};
