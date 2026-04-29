import { Hono } from "hono";
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
} from "./project.controller";

const projectRoutes = new Hono();

projectRoutes.post("/", createProject);
projectRoutes.get("/", getProjects);
projectRoutes.get("/:id", getProjectById);
projectRoutes.put("/:id", updateProject);
projectRoutes.delete("/:id", deleteProject);

export default projectRoutes;
