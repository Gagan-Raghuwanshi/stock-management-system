import { Hono } from "hono";
import { auth } from "../../middleware/auth.middleware";
import { checkPermission } from "../../middleware/permission.middleware";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "./user.controller";

export const userRoutes = new Hono();

userRoutes.post("/", auth, checkPermission("user:create"), createUser);

userRoutes.get("/", auth, checkPermission("user:view"), getAllUsers);

userRoutes.get("/:id", auth, checkPermission("user:view"), getUserById);

userRoutes.patch("/:id", auth, checkPermission("user:update"), updateUser);

userRoutes.delete("/:id", auth, checkPermission("user:delete"), deleteUser);