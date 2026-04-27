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
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

export const Group = mongoose.model<IGroup>("Group", groupSchema);
