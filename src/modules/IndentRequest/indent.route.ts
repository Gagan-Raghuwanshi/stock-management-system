import { Hono } from "hono";
import {
  createIndent,
  getAllIndents,
  getIndentById,
  updateIndent,
  updateIndentStatus,
  deleteIndent,
} from "./indent.controller";

import { auth } from "../../middleware/auth.middleware";

const indentRoutes = new Hono();

indentRoutes.use("*", auth);

indentRoutes.post("/", createIndent);
indentRoutes.get("/", getAllIndents);
indentRoutes.get("/:id", getIndentById);
indentRoutes.patch("/:id", updateIndent);
indentRoutes.patch("/:id/status", updateIndentStatus);
indentRoutes.delete("/:id", deleteIndent);

export default indentRoutes;