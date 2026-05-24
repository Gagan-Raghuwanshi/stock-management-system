import { Hono } from "hono";
import {
  createGeofence,
  getGeofences,
  getGeofenceById,
  updateGeofence,
  deleteGeofence,
} from "./geofence.controller";

import { auth } from "../../middleware/auth.middleware";

const geofenceRoutes = new Hono();

geofenceRoutes.use("*", auth);

geofenceRoutes.post("/", createGeofence);
geofenceRoutes.get("/", getGeofences);
geofenceRoutes.get("/:id", getGeofenceById);
geofenceRoutes.put("/:id", updateGeofence);
geofenceRoutes.delete("/:id", deleteGeofence);

export default geofenceRoutes;