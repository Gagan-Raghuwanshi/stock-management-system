import { Hono } from "hono";
import unitRoutes from "./modules/unit/unit.route";
import groupRoutes from "./modules/group/group.route";
import subGroupRoutes from "./modules/subGroup/subGroup.route";
import categoryRoutes from "./modules/category/category.route";
import itemRoutes from "./modules/item/item.route";
import vendorRoutes from "./modules/vendor/vendor.route";

const routes = new Hono();

routes.route("/units", unitRoutes);
routes.route("/groups", groupRoutes);
routes.route("/sub-groups", subGroupRoutes);
routes.route("/categories", categoryRoutes);
routes.route("/items", itemRoutes);
routes.route("/vendors", vendorRoutes);

export default routes;
