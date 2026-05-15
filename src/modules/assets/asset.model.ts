import mongoose, { Schema, Document } from "mongoose";

export interface IAsset extends Document {
  name: string;
  type: string;
  serialNumber?: string;
  issuedDate: Date;
  status: string;
  maintenanceDueDate?: Date;
  extraNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    serialNumber: { type: String },
    issuedDate: { type: Date },
    status: {
      type: String,
      default: "",
    },
    maintenanceDueDate: { type: Date },
    extraNote: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IAsset>("Asset", AssetSchema);
