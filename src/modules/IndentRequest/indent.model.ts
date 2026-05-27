import mongoose from "mongoose";

const indentItemSchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      default: null,
    },
    materialName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    usedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    remarks: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { _id: false }
);

const indentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    indentId: {
      type: String,
      required: true,
      trim: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    area: {
      type: String,
      default: null,
      trim: true,
    },

    items: {
      type: [indentItemSchema],
      required: true,
      validate: [(v: any[]) => v.length > 0, "At least one item is required"],
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "ConvertedToPO"],
      default: "Pending",
      index: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    nodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessNode",
      default: null,
      index: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

indentSchema.index({ organizationId: 1, indentId: 1 }, { unique: true });
indentSchema.index({ organizationId: 1, ownerId: 1 });
indentSchema.index({ organizationId: 1, nodeId: 1 });
indentSchema.index({ organizationId: 1, status: 1 });

export const Indent = mongoose.model("Indent", indentSchema);