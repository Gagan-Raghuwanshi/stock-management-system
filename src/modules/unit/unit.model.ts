import mongoose, { Schema, Document } from "mongoose";

export interface IUnit extends Document {
    label: string;
    value: string;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

const unitSchema = new Schema<IUnit>(
    {
        label: {
            type: String,
            required: [true, "Label is required"],
            trim: true,
            index: true,
        },
        value: {
            type: String,
            required: [true, "Value is required"],
            trim: true,
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

export const Unit = mongoose.model<IUnit>("Unit", unitSchema);
