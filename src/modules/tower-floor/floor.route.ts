import { Hono } from "hono";
import {
    createFloor,
    getFloors,
    getFloorById,
    updateFloor,
    deleteFloor,
} from "./floor.controller";

const floorRoutes = new Hono();

floorRoutes.post("/", createFloor);
floorRoutes.get("/", getFloors);
floorRoutes.get("/:id", getFloorById);
floorRoutes.put("/:id", updateFloor);
floorRoutes.delete("/:id", deleteFloor);

export default floorRoutes;
