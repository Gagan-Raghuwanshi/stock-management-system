import mongoose, { Schema, Document } from "mongoose";

export interface IFloor extends Document {
    floorName: string;
    floorNumber: string;
    towerId: mongoose.Types.ObjectId;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

const floorSchema = new Schema<IFloor>(
    {
        floorName: {
            type: String,
            required: [true, "Floor Name is required"],
            trim: true,
            index: true,
        },
        floorNumber: {
            type: String,
            required: [true, "Floor Number is required"],
            trim: true,
            index: true,
        },
        towerId: {
            type: Schema.Types.ObjectId,
            ref: "Tower",
            required: [true, "Tower ID is required"],
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

export const Floor = mongoose.model<IFloor>("Floor", floorSchema);
