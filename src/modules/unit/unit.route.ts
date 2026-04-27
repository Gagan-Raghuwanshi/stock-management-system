import { Hono } from "hono";
import {
    createUnit,
    getUnits,
    getUnitById,
    updateUnit,
    deleteUnit,
} from "./unit.controller";

const unitRoutes = new Hono();

unitRoutes.post("/", createUnit);
unitRoutes.get("/", getUnits);
unitRoutes.get("/:id", getUnitById);
unitRoutes.put("/:id", updateUnit);
unitRoutes.delete("/:id", deleteUnit);

export default unitRoutes;
