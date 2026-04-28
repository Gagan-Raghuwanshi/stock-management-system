import mongoose, { Schema, Document } from "mongoose";

export interface ISubGroup extends Document {
    groupId: mongoose.Types.ObjectId;
    name: string;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

const subGroupSchema = new Schema<ISubGroup>(
    {
        groupId: {
            type: Schema.Types.ObjectId,
            ref: "Group",
            required: [true, "Group ID is required"],
            index: true,
        },
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

export const SubGroup = mongoose.model<ISubGroup>("SubGroup", subGroupSchema);
