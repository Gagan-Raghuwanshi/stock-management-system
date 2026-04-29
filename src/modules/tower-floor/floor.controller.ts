import type { Context } from "hono";
import { Floor } from "./floor.model";

export const createFloor = async (c: Context) => {
    try {
        const body = await c.req.json();
        const floor = await Floor.create(body);
        return c.json({ success: true, data: floor }, 201);
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const getFloors = async (c: Context) => {
    try {
        const page = Number(c.req.query("page")) || 1;
        const limit = Number(c.req.query("limit")) || 10;
        const search = c.req.query("search");
        const status = c.req.query("status");
        const towerId = c.req.query("towerId");
        const skip = (page - 1) * limit;

        const query: any = {};
        if (search) {
            query.$or = [
                { floorName: { $regex: search, $options: "i" } },
                { floorNumber: { $regex: search, $options: "i" } },
            ];
        }
        if (status) {
            query.status = status;
        }
        if (towerId) {
            query.towerId = towerId;
        }

        const total = await Floor.countDocuments(query);
        const floors = await Floor.find(query)
            .populate("towerId", "towerName towerNumber")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return c.json({
            success: true,
            data: floors,
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

export const getFloorById = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const floor = await Floor.findById(id).populate("towerId", "towerName towerNumber");
        if (!floor) {
            return c.json({ success: false, message: "Floor not found" }, 404);
        }
        return c.json({ success: true, data: floor });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const updateFloor = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        const floor = await Floor.findByIdAndUpdate(id, body, {
            returnDocument: "after",
            runValidators: true,
        });
        if (!floor) {
            return c.json({ success: false, message: "Floor not found" }, 404);
        }
        return c.json({ success: true, data: floor });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const deleteFloor = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const floor = await Floor.findByIdAndDelete(id);
        if (!floor) {
            return c.json({ success: false, message: "Floor not found" }, 404);
        }
        return c.json({ success: true, message: "Floor deleted successfully" });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};
