import type { Context } from "hono";
import { Vendor } from "./vendor.model";

export const createVendor = async (c: Context) => {
    try {
        const body = await c.req.json();
        const vendor = await Vendor.create(body);
        return c.json({ success: true, data: vendor }, 201);
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const getVendors = async (c: Context) => {
    try {
        const page = Number(c.req.query("page")) || 1;
        const limit = Number(c.req.query("limit")) || 10;
        const search = c.req.query("search");
        const itemId = c.req.query("itemId");
        const skip = (page - 1) * limit;

        const query: any = {};
        if (search) {
            query.$or = [
                { vendorCode: { $regex: search, $options: "i" } },
                { name: { $regex: search, $options: "i" } },
                { gstNumber: { $regex: search, $options: "i" } },
                { contactPerson: { $regex: search, $options: "i" } },
                { contactNumber: { $regex: search, $options: "i" } },
            ];
        }
        if (itemId) {
            query.itemId = itemId;
        }

        const total = await Vendor.countDocuments(query);
        const vendors = await Vendor.find(query)
            .populate("itemId")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return c.json({
            success: true,
            data: vendors,
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

export const getVendorById = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const vendor = await Vendor.findById(id).populate("itemId");
        if (!vendor) {
            return c.json({ success: false, message: "Vendor not found" }, 404);
        }
        return c.json({ success: true, data: vendor });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const updateVendor = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        const vendor = await Vendor.findByIdAndUpdate(id, body, {
            returnDocument: "after",
            runValidators: true,
        });
        if (!vendor) {
            return c.json({ success: false, message: "Vendor not found" }, 404);
        }
        return c.json({ success: true, data: vendor });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};

export const deleteVendor = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const vendor = await Vendor.findByIdAndDelete(id);
        if (!vendor) {
            return c.json({ success: false, message: "Vendor not found" }, 404);
        }
        return c.json({ success: true, message: "Vendor deleted successfully" });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 400);
    }
};
