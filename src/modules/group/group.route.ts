import { Hono } from "hono";
import {
    createGroup,
    getGroups,
    getGroupById,
    updateGroup,
    deleteGroup,
} from "./group.controller";

const groupRoutes = new Hono();

groupRoutes.post("/", createGroup);
groupRoutes.get("/", getGroups);
groupRoutes.get("/:id", getGroupById);
groupRoutes.put("/:id", updateGroup);
groupRoutes.delete("/:id", deleteGroup);

export default groupRoutes;
