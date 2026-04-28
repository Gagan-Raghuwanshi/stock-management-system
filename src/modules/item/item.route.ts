import { Hono } from "hono";
import {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem,
} from "./item.controller";

const itemRoutes = new Hono();

itemRoutes.post("/", createItem);
itemRoutes.get("/", getItems);
itemRoutes.get("/:id", getItemById);
itemRoutes.put("/:id", updateItem);
itemRoutes.delete("/:id", deleteItem);

export default itemRoutes;
