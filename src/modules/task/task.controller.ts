import type { Context } from "hono";
import mongoose from "mongoose";

import { Task } from "./task.model";
import { User } from "../User/user.model";

import { buildScopeFilter } from "../../utils/buildScopeFilter";

const isValidObjectId = (id: any) =>
  mongoose.Types.ObjectId.isValid(id);

const adaptTaskScopeFilter = (scopeFilter: any) => {
  const filter = { ...scopeFilter };

  if (filter.ownerId) {
    filter.assignedToId = filter.ownerId;
    delete filter.ownerId;
  }

  return filter;
};

// ======================================================
// CREATE TASK
// ======================================================

export const createTask = async (c: Context) => {
  try {
    const user = c.get("user");

    const body = await c.req.json();

    const {
      title,
      description,
      assignedToId,
      priority,
      dueDate,
    } = body;

    if (!title || !assignedToId) {
      return c.json(
        {
          success: false,
          message: "title and assignedToId are required",
        },
        400
      );
    }

    if (!isValidObjectId(assignedToId)) {
      return c.json(
        {
          success: false,
          message: "Invalid assignedToId",
        },
        400
      );
    }

    const assignedUser = await User.findOne({
      _id: assignedToId,
      organizationId: user.organizationId,
      isActive: true,
    });


    const task = await Task.create({
      organizationId: user.organizationId,

      nodeId: assignedUser?.nodeIds?.[0] || null,

      title,

      description: description || null,

      assignedToId,

      createdById: user._id,

      priority: priority || "medium",


      dueDate: dueDate || null,
    });

    return c.json(
      {
        success: true,
        message: "Task created successfully",
        data: task,
      },
      201
    );
  } catch (error: any) {
    return c.json(
      {
        success: false,
        message: error.message,
      },
      400
    );
  }
};

// ======================================================
// GET ALL TASKS
// ======================================================

export const getAllTasks = async (c: Context) => {
  try {
    const user = c.get("user");

    const page = Number(c.req.query("page")) || 1;

    const limit = Number(c.req.query("limit")) || 10;

    const search = c.req.query("search");

    const status = c.req.query("status");

    const priority = c.req.query("priority");

    const assignedToId = c.req.query("assignedToId");

    const nodeId = c.req.query("nodeId");

    const startDate = c.req.query("startDate");

    const endDate = c.req.query("endDate");

    const sortBy = c.req.query("sortBy") || "createdAt";

    const sortOrder =
      c.req.query("sortOrder") === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const scopeFilter = adaptTaskScopeFilter(await buildScopeFilter(user));

    const filter: any = {
      ...scopeFilter,
      isActive: true,
    };

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (assignedToId) {
      if (!isValidObjectId(assignedToId)) {
        return c.json(
          {
            success: false,
            message: "Invalid assignedToId",
          },
          400
        );
      }

      filter.assignedToId = assignedToId;
    }

    if (nodeId) {
      if (!isValidObjectId(nodeId)) {
        return c.json(
          {
            success: false,
            message: "Invalid nodeId",
          },
          400
        );
      }

      filter.nodeId = nodeId;
    }

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("nodeId", "name type")
        .populate("assignedToId", "name email mobile")
        .populate("createdById", "name email mobile")
        .sort({
          [sortBy]: sortOrder,
        })
        .skip(skip)
        .limit(limit),

      Task.countDocuments(filter),
    ]);

    return c.json({
      success: true,

      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },

      data: tasks,
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        message: error.message,
      },
      400
    );
  }
};

// ======================================================
// GET SINGLE TASK
// ======================================================

export const getTaskById = async (c: Context) => {
  try {
    const user = c.get("user");

    const id = c.req.param("id");

    if (!isValidObjectId(id)) {
      return c.json(
        {
          success: false,
          message: "Invalid task id",
        },
        400
      );
    }

    const scopeFilter = adaptTaskScopeFilter(await buildScopeFilter(user));

    const task = await Task.findOne({
      _id: id,
      ...scopeFilter,
      isActive: true,
    })
      .populate("nodeId", "name type")
      .populate("assignedToId", "name email mobile")
      .populate("createdById", "name email mobile");

    if (!task) {
      return c.json(
        {
          success: false,
          message: "Task not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        message: error.message,
      },
      400
    );
  }
};

// ======================================================
// UPDATE TASK
// ======================================================

export const updateTask = async (c: Context) => {
  try {
    const user = c.get("user");

    const id = c.req.param("id");

    const body = await c.req.json();

    if (!isValidObjectId(id)) {
      return c.json(
        {
          success: false,
          message: "Invalid task id",
        },
        400
      );
    }

    const scopeFilter = adaptTaskScopeFilter(await buildScopeFilter(user));

    const task = await Task.findOne({
      _id: id,
      ...scopeFilter,
      isActive: true,
    });

    if (!task) {
      return c.json(
        {
          success: false,
          message: "Task not found",
        },
        404
      );
    }

    if (body.assignedToId) {
      if (!isValidObjectId(body.assignedToId)) {
        return c.json(
          {
            success: false,
            message: "Invalid assignedToId",
          },
          400
        );
      }

      const assignedUser = await User.findOne({
        _id: body.assignedToId,
        organizationId: user.organizationId,
        isActive: true,
      });



      task.assignedToId = body.assignedToId;
    }

    if (body.title !== undefined)
      task.title = body.title;

    if (body.description !== undefined)
      task.description = body.description;

    if (body.status !== undefined)
      task.status = body.status;

    if (body.priority !== undefined)
      task.priority = body.priority;


    if (body.dueDate !== undefined)
      task.dueDate = body.dueDate;

    if (body.status === "completed") {
      task.completedAt = new Date();
    }

    await task.save();

    return c.json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        message: error.message,
      },
      400
    );
  }
};

// ======================================================
// DELETE TASK
// ======================================================

export const deleteTask = async (c: Context) => {
  try {
    const user = c.get("user");

    const id = c.req.param("id");

    if (!isValidObjectId(id)) {
      return c.json(
        {
          success: false,
          message: "Invalid task id",
        },
        400
      );
    }

    const scopeFilter = adaptTaskScopeFilter(await buildScopeFilter(user));

    const task = await Task.findOne({
      _id: id,
      ...scopeFilter,
      isActive: true,
    });

    if (!task) {
      return c.json(
        {
          success: false,
          message: "Task not found",
        },
        404
      );
    }

    task.isActive = false;

    await task.save();

    return c.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        message: error.message,
      },
      400
    );
  }
};