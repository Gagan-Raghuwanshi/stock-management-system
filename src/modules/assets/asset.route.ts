import { Hono } from "hono";
import { createAsset, getAssets, getAssetById, updateAsset, deleteAsset, deleteMultipleAssets } from "./asset.controller";

const assetRoutes = new Hono();


assetRoutes.post("/", createAsset);
assetRoutes.get("/", getAssets);
assetRoutes.get("/:id", getAssetById);
assetRoutes.patch("/:id", updateAsset);
assetRoutes.delete("/:id", deleteAsset);
assetRoutes.post("/delete-multiple", deleteMultipleAssets);


export default assetRoutes;
