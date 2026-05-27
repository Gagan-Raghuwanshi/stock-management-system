import type { Context } from "hono";
import mongoose from "mongoose";
import { Indent } from "./indent.model";
import { buildScopeFilter } from "../../utils/buildScopeFilter";

const isValidObjectId = (id: any) => mongoose.Types.ObjectId.isValid(id);

const canManageIndentStatus = (user: any) => {
  return user?.roleId?.scope === "organization";
};

const generateIndentId = async (organizationId: string) => {
  const count = await Indent.countDocuments({ organizationId });
  return `IND-${String(count + 1).padStart(3, "0")}`;
};

export const createIndent = async (c: Context) => {
  try {
    const loggedInUser = c.get("user");
    const body = await c.req.json();

    const { projectId, area, items = [], status } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return c.json(
        { success: false, message: "At least one item is required" },
        400
      );
    }

    if (projectId && !isValidObjectId(projectId)) {
      return c.json({ success: false, message: "Invalid projectId" }, 400);
    }

    for (const item of items) {
      if (!item.materialName || !item.quantity || !item.unit) {
        return c.json(
          {
            success: false,
            message: "materialName, quantity and unit are required in items",
          },
          400
        );
      }

      if (item.materialId && !isValidObjectId(item.materialId)) {
        return c.json({ success: false, message: "Invalid materialId" }, 400);
      }
    }

    let finalStatus = "Pending";

    if (canManageIndentStatus(loggedInUser)) {
      if (status && !["Pending", "Approved"].includes(status)) {
        return c.json(
          { success: false, message: "Status can only be Pending or Approved" },
          400
        );
      }

      finalStatus = status || "Pending";
    }

    const indentId = await generateIndentId(loggedInUser.organizationId);

    const indent = await Indent.create({
      organizationId: loggedInUser.organizationId,
      indentId,
      projectId: projectId || null,
      area: area || null,
      items,
      status: finalStatus,
      requestedBy: loggedInUser._id,
      ownerId: loggedInUser._id,
      nodeId: loggedInUser.primaryNodeId || null,
      approvedBy: finalStatus === "Approved" ? loggedInUser._id : null,
      approvedAt: finalStatus === "Approved" ? new Date() : null,
    });

    const populatedIndent = await Indent.findById(indent._id)
      .populate("requestedBy", "name email")
      .populate("ownerId", "name email")
      .populate("nodeId", "name type")
      .populate("projectId", "name")
      .populate("approvedBy", "name email");

    return c.json(
      {
        success: true,
        message: "Indent created successfully",
        data: populatedIndent,
      },
      201
    );
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const getAllIndents = async (c: Context) => {
  try {
    const loggedInUser = c.get("user");

    const {
      page = "1",
      limit = "10",
      search = "",
      status,
      projectId,
    } = c.req.query();

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const scopeFilter: any = await buildScopeFilter(loggedInUser);

    const filter: any = {
      ...scopeFilter,
      isActive: true,
    };

    if (status) filter.status = status;

    if (projectId) {
      if (!isValidObjectId(projectId)) {
        return c.json({ success: false, message: "Invalid projectId" }, 400);
      }
      filter.projectId = projectId;
    }

    if (search) {
      filter.$or = [
        { indentId: { $regex: search, $options: "i" } },
        { area: { $regex: search, $options: "i" } },
        { "items.materialName": { $regex: search, $options: "i" } },
      ];
    }

    const [indents, total] = await Promise.all([
      Indent.find(filter)
        .populate("requestedBy", "name email")
        .populate("ownerId", "name email")
        .populate("nodeId", "name type")
        .populate("projectId", "name")
        .populate("approvedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Indent.countDocuments(filter),
    ]);

    return c.json({
      success: true,
      count: indents.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      data: indents,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const getIndentById = async (c: Context) => {
  try {
    const loggedInUser = c.get("user");
    const id = c.req.param("id");

    if (!isValidObjectId(id)) {
      return c.json({ success: false, message: "Invalid indent id" }, 400);
    }

    const scopeFilter: any = await buildScopeFilter(loggedInUser);

    const indent = await Indent.findOne({
      _id: id,
      ...scopeFilter,
      isActive: true,
    })
      .populate("requestedBy", "name email")
      .populate("ownerId", "name email")
      .populate("nodeId", "name type")
      .populate("projectId", "name")
      .populate("approvedBy", "name email");

    if (!indent) {
      return c.json({ success: false, message: "Indent not found" }, 404);
    }

    return c.json({
      success: true,
      data: indent,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const updateIndent = async (c: Context) => {
  try {
    const loggedInUser = c.get("user");
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!isValidObjectId(id)) {
      return c.json({ success: false, message: "Invalid indent id" }, 400);
    }

    const scopeFilter: any = await buildScopeFilter(loggedInUser);

    const indent = await Indent.findOne({
      _id: id,
      ...scopeFilter,
      isActive: true,
    });

    if (!indent) {
      return c.json({ success: false, message: "Indent not found" }, 404);
    }

    if (indent.status === "ConvertedToPO") {
      return c.json(
        { success: false, message: "Converted indent cannot be updated" },
        400
      );
    }

    const { projectId, area, items } = body;

    if (projectId !== undefined) {
      if (projectId && !isValidObjectId(projectId)) {
        return c.json({ success: false, message: "Invalid projectId" }, 400);
      }

      indent.projectId = projectId || null;
    }

    if (area !== undefined) {
      indent.area = area || null;
    }

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return c.json(
          { success: false, message: "At least one item is required" },
          400
        );
      }

      for (const item of items) {
        if (!item.materialName || !item.quantity || !item.unit) {
          return c.json(
            {
              success: false,
              message: "materialName, quantity and unit are required in items",
            },
            400
          );
        }

        if (item.materialId && !isValidObjectId(item.materialId)) {
          return c.json({ success: false, message: "Invalid materialId" }, 400);
        }
      }

      indent.items = items as any;
    }

    await indent.save();

    const updatedIndent = await Indent.findById(indent._id)
      .populate("requestedBy", "name email")
      .populate("ownerId", "name email")
      .populate("nodeId", "name type")
      .populate("projectId", "name")
      .populate("approvedBy", "name email");

    return c.json({
      success: true,
      message: "Indent updated successfully",
      data: updatedIndent,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const updateIndentStatus = async (c: Context) => {
  try {
    const loggedInUser = c.get("user");
    const id = c.req.param("id");
    const body = await c.req.json();

    const { status, rejectionReason } = body;

    if (!isValidObjectId(id)) {
      return c.json({ success: false, message: "Invalid indent id" }, 400);
    }

    if (!canManageIndentStatus(loggedInUser)) {
      return c.json(
        { success: false, message: "You are not allowed to update status" },
        403
      );
    }

    if (!["Pending", "Approved", "Rejected", "ConvertedToPO"].includes(status)) {
      return c.json({ success: false, message: "Invalid status" }, 400);
    }

    const indent = await Indent.findOne({
      _id: id,
      organizationId: loggedInUser.organizationId,
      isActive: true,
    });

    if (!indent) {
      return c.json({ success: false, message: "Indent not found" }, 404);
    }

    indent.status = status;

    if (status === "Approved") {
      indent.approvedBy = loggedInUser._id;
      indent.approvedAt = new Date();
      indent.rejectionReason = null;
    }

    if (status === "Rejected") {
      indent.approvedBy = null;
      indent.approvedAt = null;
      indent.rejectionReason = rejectionReason || null;
    }

    await indent.save();

    const updatedIndent = await Indent.findById(indent._id)
      .populate("requestedBy", "name email")
      .populate("ownerId", "name email")
      .populate("nodeId", "name type")
      .populate("projectId", "name")
      .populate("approvedBy", "name email");

    return c.json({
      success: true,
      message: "Indent status updated successfully",
      data: updatedIndent,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const deleteIndent = async (c: Context) => {
  try {
    const loggedInUser = c.get("user");
    const id = c.req.param("id");

    if (!isValidObjectId(id)) {
      return c.json({ success: false, message: "Invalid indent id" }, 400);
    }

    const scopeFilter: any = await buildScopeFilter(loggedInUser);

    const indent = await Indent.findOne({
      _id: id,
      ...scopeFilter,
      isActive: true,
    });

    if (!indent) {
      return c.json({ success: false, message: "Indent not found" }, 404);
    }

    if (indent.status === "ConvertedToPO") {
      return c.json(
        { success: false, message: "Converted indent cannot be deleted" },
        400
      );
    }

    indent.isActive = false;
    await indent.save();

    return c.json({
      success: true,
      message: "Indent deleted successfully",
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};