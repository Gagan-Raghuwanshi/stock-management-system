import type { Context } from "hono";
import { Flat } from "./flat.model";

export const createFlat = async (c: Context) => {
    try {
        const body = await c.req.json();
        const flat = await Flat.create(body);
        return c.json({ success: true, data: flat }, 201);
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const getFlats = async (c: Context) => {
    try {
        const page = Number(c.req.query("page")) || 1;
        const limit = Number(c.req.query("limit")) || 10;
        const search = c.req.query("search");
        const status = c.req.query("status");
        const floorId = c.req.query("floorId");
        const skip = (page - 1) * limit;

        const query: any = {};
        if (search) {
            query.$or = [
                { flatName: { $regex: search, $options: "i" } },
                { flatNumber: { $regex: search, $options: "i" } },
            ];
        }
        if (status) {
            query.status = status;
        }
        if (floorId) {
            query.floorId = floorId;
        }

        const total = await Flat.countDocuments(query);
        const flats = await Flat.find(query)
            .populate({
                path: "floorId",
                select: "floorName floorNumber towerId",
                populate: {
                    path: "towerId",
                    select: "towerName towerNumber"
                }
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return c.json({
            success: true,
            data: flats,
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

export const getFlatById = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const flat = await Flat.findById(id).populate({
            path: "floorId",
            select: "floorName floorNumber towerId",
            populate: {
                path: "towerId",
                select: "towerName towerNumber"
            }
        });
        if (!flat) {
            return c.json({ success: false, message: "Flat not found" }, 404);
        }
        return c.json({ success: true, data: flat });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const updateFlat = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        const flat = await Flat.findByIdAndUpdate(id, body, {
            returnDocument: "after",
            runValidators: true,
        });
        if (!flat) {
            return c.json({ success: false, message: "Flat not found" }, 404);
        }
        return c.json({ success: true, data: flat });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const deleteFlat = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const flat = await Flat.findByIdAndDelete(id);
        if (!flat) {
            return c.json({ success: false, message: "Flat not found" }, 404);
        }
        return c.json({ success: true, message: "Flat deleted successfully" });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};
