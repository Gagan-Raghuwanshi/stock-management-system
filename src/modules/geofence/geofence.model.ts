import mongoose, { Schema, Document } from "mongoose";

export interface IGeofence extends Document {
  organizationId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  nodeId?: mongoose.Types.ObjectId | null;

  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusInMeters: number;
  status: "active" | "inactive";

  createdAt: Date;
  updatedAt: Date;
}

const geofenceSchema = new Schema<IGeofence>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    nodeId: {
      type: Schema.Types.ObjectId,
      ref: "BusinessNode",
      default: null,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Geofence name is required"],
      trim: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
      min: -180,
      max: 180,
    },

    radiusInMeters: {
      type: Number,
      required: [true, "Radius is required"],
      min: 10,
      default: 100,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

// Same organization me same geofence name duplicate nahi hoga
geofenceSchema.index(
  { organizationId: 1, name: 1 },
  { unique: true }
);

// Fast CRM hierarchy filters
geofenceSchema.index({ organizationId: 1, nodeId: 1 });
geofenceSchema.index({ organizationId: 1, ownerId: 1 });
geofenceSchema.index({ organizationId: 1, status: 1 });

export const Geofence = mongoose.model<IGeofence>(
  "Geofence",
  geofenceSchema
);