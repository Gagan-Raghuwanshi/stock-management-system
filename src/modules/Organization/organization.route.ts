import { Hono } from "hono";
import { auth } from "../../middleware/auth.middleware";
import { checkPermission } from "../../middleware/permission.middleware";

import { createOrganization, getAllOrganizations,  getOrganizationById,  updateOrganization,deleteOrganization,} from "./organization.controller";

export const organizationRoutes = new Hono();

organizationRoutes.post("/",auth,checkPermission("organization:create"),createOrganization);

organizationRoutes.get("/", auth, checkPermission("organization:view"), getAllOrganizations);

organizationRoutes.get("/:id",auth,checkPermission("organization:view"), getOrganizationById);

organizationRoutes.patch("/:id",auth,checkPermission("organization:update"),updateOrganization);

organizationRoutes.delete("/:id", auth, checkPermission("organization:delete"), deleteOrganization);