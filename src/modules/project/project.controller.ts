import type { Context } from "hono";
import { Project } from "./project.model";

export const createProject = async (c: Context) => {
    try {
        const body = await c.req.json();
        const project = await Project.create(body);
        return c.json({ success: true, data: project }, 201);
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const getProjects = async (c: Context) => {
    try {
        const page = Number(c.req.query("page")) || 1;
        const limit = Number(c.req.query("limit")) || 10;
        const search = c.req.query("search");
        const status = c.req.query("status");
        const skip = (page - 1) * limit;

        const query: any = {};
        if (search) {
            query.$or = [
                { projectName: { $regex: search, $options: "i" } },
                { Address: { $regex: search, $options: "i" } },
            ];
        }
        if (status) {
            query.status = status;
        }

        const total = await Project.countDocuments(query);
        const projects = await Project.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return c.json({
            success: true,
            data: projects,
            pagination: {
                total,
                page,
                limit,
            },
        });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 500);
    }
};

export const getProjectById = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const project = await Project.findById(id);
        if (!project) {
            return c.json({ success: false, message: "Project not found" }, 404);
        }
        return c.json({ success: true, data: project });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const updateProject = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        const project = await Project.findByIdAndUpdate(id, body, {
            returnDocument: "after",
            runValidators: true,
        });
        if (!project) {
            return c.json({ success: false, message: "Project not found" }, 404);
        }
        return c.json({ success: true, data: project });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const deleteProject = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return c.json({ success: false, message: "Project not found" }, 404);
        }
        return c.json({ success: true, message: "Project deleted successfully" });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};
