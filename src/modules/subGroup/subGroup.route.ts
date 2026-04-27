import { Hono } from "hono";
import {
    createSubGroup,
    getSubGroups,
    getSubGroupById,
    updateSubGroup,
    deleteSubGroup,
} from "./subGroup.controller";

const subGroupRoutes = new Hono();

subGroupRoutes.post("/", createSubGroup);
subGroupRoutes.get("/", getSubGroups);
subGroupRoutes.get("/:id", getSubGroupById);
subGroupRoutes.put("/:id", updateSubGroup);
subGroupRoutes.delete("/:id", deleteSubGroup);

export default subGroupRoutes;
