import { Hono } from "hono";
import {
    createTower,
    getTowers,
    getTowerById,
    updateTower,
    deleteTower,
} from "./tower.controller";

const towerRoutes = new Hono();

towerRoutes.post("/", createTower);
towerRoutes.get("/", getTowers);
towerRoutes.get("/:id", getTowerById);
towerRoutes.put("/:id", updateTower);
towerRoutes.delete("/:id", deleteTower);

export default towerRoutes;
