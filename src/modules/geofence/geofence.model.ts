import mongoose, { Schema, Document } from "mongoose";

export interface IGeofence extends Document {
  organizationId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  nodeId?: mongoose.Types.ObjectId;

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
    },

    nodeId: {
      type: Schema.Types.ObjectId,
      ref: "BusinessNode",
      index: true,
      default: null,
    },

    name: {
      type: String,
      required: [true, "Geofence name is required"],
      trim: true,
      index: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
    },

    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
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

geofenceSchema.index(
  { organizationId: 1, name: 1 },
  { unique: true }
);

export const Geofence = mongoose.model<IGeofence>(
  "Geofence",
  geofenceSchema
);