import mongoose, { Schema, Document } from "mongoose";

export interface ITower extends Document {
    towerName: string;
    towerNumber: string;
    projectId: mongoose.Types.ObjectId;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

const towerSchema = new Schema<ITower>(
    {
        towerName: {
            type: String,
            required: [true, "Tower Name is required"],
            trim: true,
            index: true,
        },
        towerNumber: {
            type: String,
            required: [true, "Tower Number is required"],
            trim: true,
            index: true,
        },
        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: [true, "Project ID is required"],
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

export const Tower = mongoose.model<ITower>("Tower", towerSchema);
