import type { Context } from "hono";
import { Tower } from "./tower.model";

export const createTower = async (c: Context) => {
    try {
        const body = await c.req.json();
        const tower = await Tower.create(body);
        return c.json({ success: true, data: tower }, 201);
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const getTowers = async (c: Context) => {
    try {
        const page = Number(c.req.query("page")) || 1;
        const limit = Number(c.req.query("limit")) || 10;
        const search = c.req.query("search");
        const status = c.req.query("status");
        const projectId = c.req.query("projectId");
        const skip = (page - 1) * limit;

        const query: any = {};
        if (search) {
            query.$or = [
                { towerName: { $regex: search, $options: "i" } },
                { towerNumber: { $regex: search, $options: "i" } },
            ];
        }
        if (status) {
            query.status = status;
        }
        if (projectId) {
            query.projectId = projectId;
        }

        const total = await Tower.countDocuments(query);
        const towers = await Tower.find(query)
            .populate("projectId", "projectName")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return c.json({
            success: true,
            data: towers,
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

export const getTowerById = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const tower = await Tower.findById(id).populate("projectId", "projectName");
        if (!tower) {
            return c.json({ success: false, message: "Tower not found" }, 404);
        }
        return c.json({ success: true, data: tower });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const updateTower = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        const tower = await Tower.findByIdAndUpdate(id, body, {
            returnDocument: "after",
            runValidators: true,
        });
        if (!tower) {
            return c.json({ success: false, message: "Tower not found" }, 404);
        }
        return c.json({ success: true, data: tower });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const deleteTower = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const tower = await Tower.findByIdAndDelete(id);
        if (!tower) {
            return c.json({ success: false, message: "Tower not found" }, 404);
        }
        return c.json({ success: true, message: "Tower deleted successfully" });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};
