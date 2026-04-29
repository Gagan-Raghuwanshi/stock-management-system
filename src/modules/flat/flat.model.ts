import mongoose, { Schema, Document } from "mongoose";

export interface IFlat extends Document {
    flatName: string;
    flatNumber: string;
    floorId: mongoose.Types.ObjectId;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

const flatSchema = new Schema<IFlat>(
    {
        flatName: {
            type: String,
            required: [true, "Flat Name is required"],
            trim: true,
            index: true,
        },
        flatNumber: {
            type: String,
            required: [true, "Flat Number is required"],
            trim: true,
            index: true,
        },
        floorId: {
            type: Schema.Types.ObjectId,
            ref: "Floor",
            required: [true, "Floor ID is required"],
            index: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Flat = mongoose.model<IFlat>("Flat", flatSchema);
