import { Hono } from "hono";
import unitRoutes from "./modules/unit/unit.route";
import groupRoutes from "./modules/group/group.route";
import subGroupRoutes from "./modules/subGroup/subGroup.route";
import categoryRoutes from "./modules/category/category.route";
import itemRoutes from "./modules/item/item.route";
import vendorRoutes from "./modules/vendor/vendor.route";
import projectRoutes from "./modules/project/project.route";
import towerRoutes from "./modules/tower/tower.route";
import floorRoutes from "./modules/tower-floor/floor.route";
import outsideRoutes from "./modules/tower-outside/outside.route";
import flatRoutes from "./modules/flat/flat.route";

const routes = new Hono();

routes.route("/units", unitRoutes);
routes.route("/groups", groupRoutes);
routes.route("/sub-groups", subGroupRoutes);
routes.route("/categories", categoryRoutes);
routes.route("/items", itemRoutes);
routes.route("/vendors", vendorRoutes);
routes.route("/projects", projectRoutes);
routes.route("/towers", towerRoutes);
routes.route("/floors", floorRoutes);
routes.route("/outsides", outsideRoutes);
routes.route("/flats", flatRoutes);

export default routes;
