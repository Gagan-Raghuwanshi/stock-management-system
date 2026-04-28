import type { Context } from "hono";
import { Unit } from "./unit.model";

export const createUnit = async (c: Context) => {
    try {
        const body = await c.req.json();
        const unit = await Unit.create(body);
        return c.json({ success: true, data: unit }, 201);
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const getUnits = async (c: Context) => {
    try {
        const page = Number(c.req.query("page")) || 1;
        const limit = Number(c.req.query("limit")) || 10;
        const search = c.req.query("search");
        const status = c.req.query("status");
        const skip = (page - 1) * limit;

        const query: any = {};
        if (search) {
            query.$or = [
                { label: { $regex: search, $options: "i" } },
                { value: { $regex: search, $options: "i" } },
            ];
        }
        if (status) {
            query.status = status;
        }

        const total = await Unit.countDocuments(query);
        const units = await Unit.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

        return c.json({
            success: true,
            data: units,
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

export const getUnitById = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const unit = await Unit.findById(id);
        if (!unit) {
            return c.json({ success: false, message: "Unit not found" }, 404);
        }
        return c.json({ success: true, data: unit });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const updateUnit = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        const unit = await Unit.findByIdAndUpdate(id, body, {
            returnDocument: "after",
            runValidators: true,
        });
        if (!unit) {
            return c.json({ success: false, message: "Unit not found" }, 404);
        }
        return c.json({ success: true, data: unit });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const deleteUnit = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const unit = await Unit.findByIdAndDelete(id);
        if (!unit) {
            return c.json({ success: false, message: "Unit not found" }, 404);
        }
        return c.json({ success: true, message: "Unit deleted successfully" });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};
