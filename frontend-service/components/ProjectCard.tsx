import Link from "next/link";
export default function ProjectCard({ project }: { project: any }) {
  return (
    <Link href={`/dashboard/${project.id}`}>
      <div className="p-4 border rounded-xl shadow hover:shadow-lg cursor-pointer transition bg-gray-500">
        <h2 className="text-lg font-bold">{project.name}</h2>
        <p>{project.description}</p>
        <p className="text-sm">{project.stackName}</p>
      </div>
    </Link>
  );
}
