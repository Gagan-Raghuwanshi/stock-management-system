import type { Context } from "hono";
import { Outside } from "./outside.model";

export const createOutside = async (c: Context) => {
    try {
        const body = await c.req.json();
        const outside = await Outside.create(body);
        return c.json({ success: true, data: outside }, 201);
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const getOutsides = async (c: Context) => {
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
                { outsideName: { $regex: search, $options: "i" } },
                { outsideNote: { $regex: search, $options: "i" } },
            ];
        }
        if (status) {
            query.status = status;
        }
        if (towerId) {
            query.towerId = towerId;
        }

        const total = await Outside.countDocuments(query);
        const outsides = await Outside.find(query)
            .populate("towerId", "towerName towerNumber")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return c.json({
            success: true,
            data: outsides,
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

export const getOutsideById = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const outside = await Outside.findById(id).populate("towerId", "towerName towerNumber");
        if (!outside) {
            return c.json({ success: false, message: "Outside record not found" }, 404);
        }
        return c.json({ success: true, data: outside });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const updateOutside = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        const outside = await Outside.findByIdAndUpdate(id, body, {
            returnDocument: "after",
            runValidators: true,
        });
        if (!outside) {
            return c.json({ success: false, message: "Outside record not found" }, 404);
        }
        return c.json({ success: true, data: outside });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const deleteOutside = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const outside = await Outside.findByIdAndDelete(id);
        if (!outside) {
            return c.json({ success: false, message: "Outside record not found" }, 404);
        }
        return c.json({ success: true, message: "Outside record deleted successfully" });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};
