import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
    groupIds: mongoose.Types.ObjectId[];
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
    {
        groupIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "Group",
                required: [true, "Group IDs are required"],
            },
        ],
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Category = mongoose.model<ICategory>("Category", categorySchema);
