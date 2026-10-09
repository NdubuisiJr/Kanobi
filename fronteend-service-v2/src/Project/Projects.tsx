import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import ProjectCard from "../components/ProjectCard";
import { useEffect, useState } from "react";
import Dialog from "../components/Dialog";
import LoadingScreen from "../components/LoadingScreen";

export default function Projects() {
  const { projects } = useLoaderData();
  const actionData = useActionData();
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (actionData?.success) setOpen(false);
  }, [actionData]);

  return navigation.state == "loading" || navigation.state == "submitting" ? (
    <LoadingScreen />
  ) : (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="flex">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <button
          className="py-0 px-10 rounded ml-auto leading-none bg-blue-500 h-10"
          onClick={() => setOpen(true)}
        >
          New
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.data.map((project: any) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <Dialog isOpen={open} onClose={() => setOpen(false)} title="New Project">
        <Form action="/project" method="post">
          <input
            className="border p-2 rounded w-full mb-2 placeholder:text-white"
            placeholder="Project name"
            name="name"
          />
          <input
            className="border p-2 rounded w-full mb-4 placeholder:text-white"
            placeholder="description"
            name="description"
          />
          <button
            type="submit"
            name="action"
            value="post"
            className="mt-4 bg-blue-500 text-white px-3 py-1 rounded"
          >
            Create
          </button>
          <button
            onClick={() => setOpen(false)}
            className="mt-4 ml-5 bg-red-500 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        </Form>
      </Dialog>
    </div>
  );
}
