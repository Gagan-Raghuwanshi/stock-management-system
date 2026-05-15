import type { Context } from "hono";
import TrackAssetRecord from "./trackAssetRecords.model";
import path from "path";
import fs from "fs";

export const createTrackRecord = async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const amount = formData.get("amount");
    const description = formData.get("description") as string;
    const assetId = formData.get("assetId") as string;

    if (!amount || !description || !assetId) {
      return c.json({ error: "Amount, description, and assetId are required" }, 400);
    }

    const files = formData.getAll("images");
    const uploadedFilePaths: string[] = [];

    const uploadDir = path.join(process.cwd(), "uploads", "track-assets");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const file of files) {
      if (file instanceof File) {
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/\s+/g, "_");
        const uniqueName = `${timestamp}-${sanitizedName}`;
        const filePath = path.join(uploadDir, uniqueName);
        
        await Bun.write(filePath, file);
        
        uploadedFilePaths.push(`/uploads/track-assets/${uniqueName}`);
      }
    }

    const newRecord = new TrackAssetRecord({
      amount: Number(amount),
      description,
      assetId: assetId as any,

      images: uploadedFilePaths,
    });

    await newRecord.save();

    return c.json({
      message: "Track record created successfully",
      data: newRecord,
    }, 201);
  } catch (error: any) {
    console.error("Create track record error:", error);
    return c.json({ error: error.message || "Failed to create track record" }, 500);
  }
};

export const getTrackRecordsByAsset = async (c: Context) => {
  try {
    const assetId = c.req.param("assetId");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const sortBy = c.req.query("sortBy") || "createdAt";
    const sortOrder = c.req.query("sortOrder") || "desc";

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [records, total] = await Promise.all([
      TrackAssetRecord.find({ assetId: assetId as any })
        .populate("assetId", "name serialNumber type status")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      TrackAssetRecord.countDocuments({ assetId: assetId as any })
    ]);

    return c.json({
      data: records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const getAllTrackRecords = async (c: Context) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const sortBy = c.req.query("sortBy") || "createdAt";
    const sortOrder = c.req.query("sortOrder") || "desc";

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [records, total] = await Promise.all([
      TrackAssetRecord.find()
        .populate("assetId", "name serialNumber type status")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      TrackAssetRecord.countDocuments()
    ]);

    return c.json({
      data: records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updateTrackRecord = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const contentType = c.req.header("content-type") || "";
    
    let updateData: any = {};
    let newImages: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await c.req.formData();
      const amount = formData.get("amount");
      if (amount) updateData.amount = Number(amount);
      
      const description = formData.get("description");
      if (description) updateData.description = description as string;

      const files = formData.getAll("images");
      if (files && files.length > 0) {
        const uploadDir = path.join(process.cwd(), "uploads", "track-assets");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        for (const file of files) {
          if (file instanceof File) {
            const timestamp = Date.now();
            const sanitizedName = file.name.replace(/\s+/g, "_");
            const uniqueName = `${timestamp}-${sanitizedName}`;
            const filePath = path.join(uploadDir, uniqueName);
            await Bun.write(filePath, file);
            newImages.push(`/uploads/track-assets/${uniqueName}`);
          }
        }
      }
    } else {
      updateData = await c.req.json();
    }

    const existingRecord = await TrackAssetRecord.findById(id);
    if (!existingRecord) {
      return c.json({ error: "Record not found" }, 404);
    }

    if (newImages.length > 0) {
      updateData.images = [...(existingRecord.images || []), ...newImages];
    }

    const updatedRecord = await TrackAssetRecord.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    return c.json({
      message: "Track record updated successfully",
      data: updatedRecord,
    });
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to update track record" }, 500);
  }
};


export const deleteTrackRecord = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const record = await TrackAssetRecord.findById(id);
    
    if (!record) {
      return c.json({ error: "Record not found" }, 404);
    }

    // Delete files from disk
    if (record.images && record.images.length > 0) {
      for (const imagePath of record.images) {
        const fullPath = path.join(process.cwd(), imagePath.startsWith('/') ? imagePath.substring(1) : imagePath);
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
          } catch (err) {
            console.error(`Failed to delete file: ${fullPath}`, err);
          }
        }
      }
    }

    await TrackAssetRecord.findByIdAndDelete(id);

    return c.json({ message: "Track record deleted successfully" });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const deleteTrackRecordImage = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    let pathsToDelete: string[] = [];

    if (body.fileUrls && Array.isArray(body.fileUrls)) {
      pathsToDelete = body.fileUrls;
    } else if (body.imagePath) {
      pathsToDelete = [body.imagePath];
    }

    if (pathsToDelete.length === 0) {
      return c.json({ error: "Please provide fileUrls array or imagePath to delete" }, 400);
    }

    const record = await TrackAssetRecord.findById(id);
    if (!record) {
      return c.json({ error: "Record not found" }, 404);
    }

    if (!record.images || record.images.length === 0) {
      return c.json({ error: "No images found in this record" }, 404);
    }

    let deletedCount = 0;

    for (const imagePath of pathsToDelete) {
      if (record.images.includes(imagePath)) {
        // Remove the image path from the array
        record.images = record.images.filter((img) => img !== imagePath);
        
        // Delete the physical file
        const fullPath = path.join(process.cwd(), imagePath.startsWith('/') ? imagePath.substring(1) : imagePath);
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
            deletedCount++;
          } catch (err) {
            console.error(`Failed to delete file: ${fullPath}`, err);
          }
        } else {
           // count as deleted if file doesn't exist but was removed from array
           deletedCount++;
        }
      }
    }

    await record.save();

    return c.json({ 
      message: `Successfully deleted ${deletedCount} image(s)`, 
      data: record 
    });
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to delete image(s)" }, 500);
  }
};
