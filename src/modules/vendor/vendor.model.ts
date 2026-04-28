import mongoose, { Schema, Document } from "mongoose";

export interface IVendor extends Document {
    vendorCode: string;
    name: string;
    address: string;
    gstNumber: string;
    contactPerson: string;
    contactNumber: string;
    itemId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
    {
        vendorCode: {
            type: String,
            required: [true, "Vendor Code is required"],
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        gstNumber: {
            type: String,
            trim: true,
        },
        contactPerson: {
            type: String,
            trim: true,
        },
        contactNumber: {
            type: String,
            trim: true,
        },
        itemId: {
            type: Schema.Types.ObjectId,
            ref: "Item",
        },
    },
    {
        timestamps: true,
    }
);

export const Vendor = mongoose.model<IVendor>("Vendor", vendorSchema);
