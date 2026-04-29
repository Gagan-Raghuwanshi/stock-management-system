import { Hono } from "hono";
import {
    createOutside,
    getOutsides,
    getOutsideById,
    updateOutside,
    deleteOutside,
} from "./outside.controller";

const outsideRoutes = new Hono();

outsideRoutes.post("/", createOutside);
outsideRoutes.get("/", getOutsides);
outsideRoutes.get("/:id", getOutsideById);
outsideRoutes.put("/:id", updateOutside);
outsideRoutes.delete("/:id", deleteOutside);

export default outsideRoutes;
