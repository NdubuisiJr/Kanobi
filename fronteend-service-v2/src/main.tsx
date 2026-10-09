import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import Login from "./Login/Login.tsx";
import { loginAction } from "./Login/action.ts";
import Projects from "./Project/Projects.tsx";
import { projectsLoader } from "./Project/loader.ts";
import { projectAction } from "./Project/action.ts";
import ProjectDetails from "./ProjectDetail/ProjectDetails.tsx";
import { projectDetailLoader } from "./ProjectDetail/loader.ts";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
    action: loginAction,
  },
  {
    path: "/project",
    Component: Projects,
    loader: projectsLoader,
    action: projectAction,
  },
  {
    path: "/project/:id",
    Component: ProjectDetails,
    loader: projectDetailLoader,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
