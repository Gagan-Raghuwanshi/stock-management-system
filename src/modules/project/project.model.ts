import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
    projectName: string;
    Address: string;
    startDate: Date;
    notes?: string;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
    {
        projectName: {
            type: String,
            required: [true, "Project Name is required"],
            trim: true,
            index: true,
        },
        Address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
        },
        startDate: {
            type: Date,
            required: [true, "Start Date is required"],
        },
        notes: {
            type: String,
            trim: true,
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

export const Project = mongoose.model<IProject>("Project", projectSchema);
