import type { Context } from "hono";
import { Item } from "./item.model";

export const createItem = async (c: Context) => {
    try {
        const body = await c.req.json();
        const item = await Item.create(body);
        return c.json({ success: true, data: item }, 201);
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const getItems = async (c: Context) => {
    try {
        const items = await Item.find()
            .populate("unitId")
            .populate("groupId")
            .populate("subGroupId")
            .populate("categoryId")
            .sort({ createdAt: -1 });
        return c.json({ success: true, data: items });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 500);
    }
};

export const getItemById = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const item = await Item.findById(id)
            .populate("unitId")
            .populate("groupId")
            .populate("subGroupId")
            .populate("categoryId");
        if (!item) {
            return c.json({ success: false, message: "Item not found" }, 404);
        }
        return c.json({ success: true, data: item });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const updateItem = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        const item = await Item.findByIdAndUpdate(id, body, {
            returnDocument: "after",
            runValidators: true,
        });
        if (!item) {
            return c.json({ success: false, message: "Item not found" }, 404);
        }
        return c.json({ success: true, data: item });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const deleteItem = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const item = await Item.findByIdAndDelete(id);
        if (!item) {
            return c.json({ success: false, message: "Item not found" }, 404);
        }
        return c.json({ success: true, message: "Item deleted successfully" });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};
