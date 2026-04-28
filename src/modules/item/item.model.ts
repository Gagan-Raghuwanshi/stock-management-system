import mongoose, { Schema, Document } from "mongoose";

export interface IItem extends Document {
    itemCode: string;
    HSNcode: string;
    itemName: string;
    blockItem: boolean;
    specification: string;
    openingLedger: string;
    openingPhysical: string;
    size: string;
    info: string;
    unitId: mongoose.Types.ObjectId;
    groupId: mongoose.Types.ObjectId;
    subGroupId: mongoose.Types.ObjectId;
    categoryId: mongoose.Types.ObjectId;
    newItemCode: string;
    price: string;
    minLevel: string;
    maxLevel: string;
    gstPercentage: string;
    createdAt: Date;
    updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
    {
        itemCode: {
            type: String,
            required: [true, "Item Code is required"],
            unique: true,
            trim: true,
        },
        HSNcode: {
            type: String,
            trim: true,
        },
        itemName: {
            type: String,
            required: [true, "Item Name is required"],
            trim: true,
        },
        blockItem: {
            type: Boolean,
            default: false,
        },
        specification: {
            type: String,
            trim: true,
        },
        openingLedger: {
            type: String,
            trim: true,
        },
        openingPhysical: {
            type: String,
            trim: true,
        },
        size: {
            type: String,
            trim: true,
        },
        info: {
            type: String,
            trim: true,
        },
        unitId: {
            type: Schema.Types.ObjectId,
            ref: "Unit",
        },
        groupId: {
            type: Schema.Types.ObjectId,
            ref: "Group",
        },
        subGroupId: {
            type: Schema.Types.ObjectId,
            ref: "SubGroup",
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
        },
        newItemCode: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        price: {
            type: String,
            trim: true,
        },
        minLevel: {
            type: String,
            trim: true,
        },
        maxLevel: {
            type: String,
            trim: true,
        },
        gstPercentage: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Item = mongoose.model<IItem>("Item", itemSchema);
