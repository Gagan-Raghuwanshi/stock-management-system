import { Hono } from "hono";
import { createTrackRecord, getTrackRecordsByAsset, deleteTrackRecord, getAllTrackRecords, updateTrackRecord, deleteTrackRecordImage } from "./trackAssetRecords.controller";

const trackAssetRoutes = new Hono();


trackAssetRoutes.post("/", createTrackRecord);
trackAssetRoutes.get("/", getAllTrackRecords);
trackAssetRoutes.get("/asset/:assetId", getTrackRecordsByAsset);
trackAssetRoutes.patch("/:id", updateTrackRecord);
trackAssetRoutes.post("/:id/delete-image", deleteTrackRecordImage);
trackAssetRoutes.delete("/:id", deleteTrackRecord);

export default trackAssetRoutes;
