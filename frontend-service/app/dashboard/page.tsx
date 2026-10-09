import ProjectCard from "../../components/ProjectCard";

export default async function DashboardPage() {
  const response = await fetch(
    "https://avw4j9bkn7.execute-api.eu-west-1.amazonaws.com/staging/project"
  );
  const projects = await response.json();
  return (
    <div className="min-h-screen p-8 bg-gray-900">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.data.map((project: any) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
