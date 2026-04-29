import { Hono } from "hono";
import {
    createFlat,
    getFlats,
    getFlatById,
    updateFlat,
    deleteFlat,
} from "./flat.controller";

const flatRoutes = new Hono();

flatRoutes.post("/", createFlat);
flatRoutes.get("/", getFlats);
flatRoutes.get("/:id", getFlatById);
flatRoutes.put("/:id", updateFlat);
flatRoutes.delete("/:id", deleteFlat);

export default flatRoutes;
