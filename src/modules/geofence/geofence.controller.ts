import type { Context } from "hono";
import mongoose from "mongoose";
import { Geofence } from "./geofence.model";
import { buildScopeFilter } from "../../utils/buildScopeFilter";

const isMongoId = (id: string): boolean =>
  mongoose.Types.ObjectId.isValid(id);

export const createGeofence = async (c: Context) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();

    if (!body.name || body.latitude === undefined || body.longitude === undefined) {
      return c.json(
        {
          success: false,
          message: "name, latitude and longitude are required",
        },
        400
      );
    }

    if (body.nodeId && !isMongoId(body.nodeId)) {
      return c.json({ success: false, message: "Invalid nodeId" }, 400);
    }

    const exists = await Geofence.findOne({
      organizationId: user.organizationId,
      name: body.name,
    });

    if (exists) {
      return c.json(
        {
          success: false,
          message: "Geofence already exists",
        },
        409
      );
    }

    const geofence = await Geofence.create({
      ...body,
      organizationId: user.organizationId,
      ownerId: user._id,
      createdBy: user._id,
      nodeId: body.nodeId || user.nodeIds?.[0] || null,
    });

    return c.json(
      {
        success: true,
        message: "Geofence created successfully",
        data: geofence,
      },
      201
    );
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const getGeofences = async (c: Context) => {
  try {
    const user = c.get("user");
    const scopeFilter = await buildScopeFilter(user);

    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;
    const search = c.req.query("search");
    const status = c.req.query("status");
    const nodeId = c.req.query("nodeId");

    const skip = (page - 1) * limit;

    const query: any = {
      ...scopeFilter,
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (nodeId) {
      if (!isMongoId(nodeId)) {
        return c.json({ success: false, message: "Invalid nodeId" }, 400);
      }
      query.nodeId = nodeId;
    }

    const total = await Geofence.countDocuments(query);

    const geofences = await Geofence.find(query)
      .populate("nodeId", "name title")
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return c.json({
      success: true,
      data: geofences,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

export const getGeofenceById = async (c: Context) => {
  try {
    const user = c.get("user");
    const scopeFilter = await buildScopeFilter(user);
    const id = c.req.param("id");

    if (!id) {
      return c.json({ success: false, message: "Geofence id is required" }, 400);
    }

    if (!isMongoId(id)) {
      return c.json({ success: false, message: "Invalid geofence id" }, 400);
    }

    const geofence = await Geofence.findOne({
      _id: id,
      ...scopeFilter,
    })
      .populate("nodeId", "name title")
      .populate("createdBy", "name email");

    if (!geofence) {
      return c.json({ success: false, message: "Geofence not found" }, 404);
    }

    return c.json({
      success: true,
      data: geofence,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const updateGeofence = async (c: Context) => {
  try {
    const user = c.get("user");
    const scopeFilter = await buildScopeFilter(user);
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!id) {
      return c.json({ success: false, message: "Geofence id is required" }, 400);
    }

    if (!isMongoId(id)) {
      return c.json({ success: false, message: "Invalid geofence id" }, 400);
    }

    if (body.nodeId && !isMongoId(body.nodeId)) {
      return c.json({ success: false, message: "Invalid nodeId" }, 400);
    }

    if (body.name) {
      const exists = await Geofence.findOne({
        _id: { $ne: id },
        organizationId: user.organizationId,
        name: body.name,
      });

      if (exists) {
        return c.json(
          {
            success: false,
            message: "Geofence already exists",
          },
          409
        );
      }
    }

    delete body.organizationId;
    delete body.ownerId;
    delete body.createdBy;

    const geofence = await Geofence.findOneAndUpdate(
      {
        _id: id,
        ...scopeFilter,
      },
      body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("nodeId", "name title")
      .populate("createdBy", "name email");

    if (!geofence) {
      return c.json({ success: false, message: "Geofence not found" }, 404);
    }

    return c.json({
      success: true,
      message: "Geofence updated successfully",
      data: geofence,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const deleteGeofence = async (c: Context) => {
  try {
    const user = c.get("user");
    const scopeFilter = await buildScopeFilter(user);
    const id = c.req.param("id");

    if (!id) {
      return c.json({ success: false, message: "Geofence id is required" }, 400);
    }

    if (!isMongoId(id)) {
      return c.json({ success: false, message: "Invalid geofence id" }, 400);
    }

    const geofence = await Geofence.findOneAndDelete({
      _id: id,
      ...scopeFilter,
    });

    if (!geofence) {
      return c.json({ success: false, message: "Geofence not found" }, 404);
    }

    return c.json({
      success: true,
      message: "Geofence deleted successfully",
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};