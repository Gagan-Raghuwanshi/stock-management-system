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
        },
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

export const SubGroup = mongoose.model<ISubGroup>("SubGroup", subGroupSchema);
