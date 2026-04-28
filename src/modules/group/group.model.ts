import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
    name: string;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
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

export const Group = mongoose.model<IGroup>("Group", groupSchema);
