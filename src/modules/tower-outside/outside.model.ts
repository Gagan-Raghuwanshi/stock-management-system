import mongoose, { Schema, Document } from "mongoose";

export interface IOutside extends Document {
    outsideName: string;
    outsideNote?: string;
    towerId: mongoose.Types.ObjectId;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

const outsideSchema = new Schema<IOutside>(
    {
        outsideName: {
            type: String,
            required: [true, "Outside Name is required"],
            trim: true,
            index: true,
        },
        outsideNote: {
            type: String,
            trim: true,
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

export const Outside = mongoose.model<IOutside>("Outside", outsideSchema);
