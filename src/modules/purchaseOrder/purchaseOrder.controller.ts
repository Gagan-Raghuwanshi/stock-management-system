import type { Context } from "hono";
import mongoose from "mongoose";
import { PurchaseOrder } from "./purchaseOrder.model";
import { MaterialStock } from "../materialStock/materialStock.model";
import { Indent } from "../IndentRequest/indent.model";
import { buildScopeFilter } from "../../utils/buildScopeFilter";

const isValidObjectId = (id: any) => mongoose.Types.ObjectId.isValid(id);

const getLoggedInUserId = (user: any) => user?._id || user?.id;

const getUserScope = (user: any) => {
  return user?.scope || user?.role?.scope || user?.roleId?.scope;
};

const generatePoNo = async (organizationId: string) => {
  const count = await PurchaseOrder.countDocuments({ organizationId });
  return `PO-${String(count + 1).padStart(3, "0")}`;
};

const buildPurchaseOrderScopeFilter = async (loggedInUser: any) => {
  const scope = getUserScope(loggedInUser);
  const loggedInUserId = getLoggedInUserId(loggedInUser);

  const filter: any = {
    organizationId: loggedInUser.organizationId,
  };

  if (scope === "organization") {
    return filter;
  }

  if (scope === "team") {
    const scopeFilter: any = await buildScopeFilter(loggedInUser);

    if (scopeFilter.ownerId?.$in) {
      filter.createdBy = { $in: scopeFilter.ownerId.$in };
    } else if (scopeFilter.ownerId) {
      filter.createdBy = scopeFilter.ownerId;
    } else {
      filter.createdBy = loggedInUserId;
    }

    return filter;
  }

  filter.createdBy = loggedInUserId;
  return filter;
};

const populatePurchaseOrder = (query: any) => {
  return query
    .populate("indentId", "indentId status")
    .populate("projectId", "projectName name")
    .populate("requesterId", "name email mobile")
    .populate("items.itemId", "itemName name")
    .populate("items.unitId", "unitName name")
    .populate("createdBy", "name email mobile")
    .populate("approvedBy", "name email mobile")
    .populate("approvals.roleId", "name scope")
    .populate("approvals.approvedBy", "name email mobile");
};

export const createPurchaseOrderFromIndent = async (c: Context) => {
  try {
    const loggedInUser = c.get("user");
    const loggedInUserId = getLoggedInUserId(loggedInUser);
    const body = await c.req.json();

    const {
      indentId,
      vendorId,
      vendorName,
      vendorMobile,
      vendorAddress,
      items = [],
    } = body;

    if (!indentId || !vendorId) {
      return c.json(
        { success: false, message: "indentId and vendorId are required" },
        400
      );
    }

    if (!isValidObjectId(indentId)) {
      return c.json({ success: false, message: "Invalid indentId" }, 400);
    }

    if (!isValidObjectId(vendorId)) {
      return c.json({ success: false, message: "Invalid vendorId" }, 400);
    }

    const indent = await Indent.findOne({
      _id: indentId,
      organizationId: loggedInUser.organizationId,
      isActive: true,
    });

    if (!indent) {
      return c.json({ success: false, message: "Indent not found" }, 404);
    }

    if (indent.status !== "Approved") {
      return c.json(
        {
          success: false,
          message: "Only approved indent can be converted to purchase order",
        },
        400
      );
    }

    const oldPo = await PurchaseOrder.findOne({
      indentId,
      organizationId: loggedInUser.organizationId,
      isActive: true,
    });

    if (oldPo) {
      return c.json(
        {
          success: false,
          message: "Purchase order already created for this indent",
        },
        400
      );
    }

    const finalItems =
      Array.isArray(items) && items.length > 0
        ? items
        : indent.items.map((item: any) => ({
            itemId: item.itemId,
            unitId: item.unitId,
            indentQuantity: item.quantity,
            orderQuantity: item.quantity,
            rate: 0,
          }));

    if (!Array.isArray(finalItems) || finalItems.length === 0) {
      return c.json(
        { success: false, message: "At least one PO item is required" },
        400
      );
    }

    let totalAmount = 0;

    const poItems = finalItems.map((item: any) => {
      if (!item.itemId || !item.unitId || !item.orderQuantity) {
        throw new Error("itemId, unitId and orderQuantity are required");
      }

      const orderQuantity = Number(item.orderQuantity);
      const rate = Number(item.rate || 0);
      const amount = orderQuantity * rate;

      totalAmount += amount;

      return {
        itemId: item.itemId,
        unitId: item.unitId,
        indentQuantity: Number(item.indentQuantity || item.orderQuantity || 0),
        orderQuantity,
        rate,
        amount,
      };
    });

    const poNo = await generatePoNo(loggedInUser.organizationId);

    const po = await PurchaseOrder.create({
      organizationId: loggedInUser.organizationId,
      poNo,
      indentId,
      vendorId,
      projectId: indent.projectId,
      requesterId: indent.userId,
      vendorName,
      vendorMobile: vendorMobile || null,
      vendorAddress: vendorAddress || null,
      items: poItems,
      totalAmount,

      status: "Approved",
      approvalFlowId: null,
      currentApprovalLevel: 0,
      approvals: [],

      createdBy: loggedInUserId,
      approvedBy: loggedInUserId,
      approvedAt: new Date(),
    });

    indent.status = "ConvertedToPO";
    await indent.save();

    const populatedPo = await populatePurchaseOrder(
      PurchaseOrder.findById(po._id)
    );

    return c.json(
      {
        success: true,
        message: "Purchase order created successfully",
        data: populatedPo,
      },
      201
    );
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const approvePurchaseOrder = async (c: Context) => {
  return c.json(
    {
      success: false,
      message:
        "Purchase order approval flow removed. PO is created as Approved after indent approval.",
    },
    400
  );
};

export const markPurchaseOrderOrdered = async (c: Context) => {
  try {
    const loggedInUser = c.get("user");
    const id = c.req.param("id");

    if (!isValidObjectId(id)) {
      return c.json(
        { success: false, message: "Invalid purchase order id" },
        400
      );
    }

    const po = await PurchaseOrder.findOne({
      _id: id,
      organizationId: loggedInUser.organizationId,
      isActive: true,
    });

    if (!po) {
      return c.json({ success: false, message: "Purchase order not found" }, 404);
    }

    if (po.status !== "Approved") {
      return c.json(
        { success: false, message: "Only approved purchase order can be ordered" },
        400
      );
    }

    po.status = "Ordered";
    await po.save();

    const populatedPo = await populatePurchaseOrder(PurchaseOrder.findById(po._id));

    return c.json({
      success: true,
      message: "Purchase order marked as ordered successfully",
      data: populatedPo,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const receivePurchaseOrderMaterial = async (c: Context) => {
  try {
    const loggedInUser = c.get("user");
    const id = c.req.param("id");
    const body = await c.req.json();

    const { items = [] } = body;

    if (!isValidObjectId(id)) {
      return c.json(
        { success: false, message: "Invalid purchase order id" },
        400
      );
    }

    const po = await PurchaseOrder.findOne({
      _id: id,
      organizationId: loggedInUser.organizationId,
      isActive: true,
    });

    if (!po) {
      return c.json({ success: false, message: "Purchase order not found" }, 404);
    }

    if (!["Approved", "Ordered", "PartiallyReceived"].includes(po.status)) {
      return c.json(
        { success: false, message: "Material cannot be received in current status" },
        400
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return c.json(
        { success: false, message: "At least one received item is required" },
        400
      );
    }

    for (const receivedItem of items) {
      const poItem: any = po.items.find(
        (item: any) => String(item.itemId) === String(receivedItem.itemId)
      );

      if (!poItem) {
        return c.json(
          { success: false, message: "PO item not found" },
          400
        );
      }

      const receivedQty = Number(receivedItem.receivedQuantity || 0);

      let stock = await MaterialStock.findOne({
        organizationId: po.organizationId,
        projectId: po.projectId,
        indentId: po.indentId,
        purchaseOrderId: po._id,
        requesterId: po.requesterId,
        itemId: poItem.itemId,
        unitId: poItem.unitId,
      });

      if (stock) {
        stock.receivedQuantity += receivedQty;
        stock.availableQuantity += receivedQty;
        stock.purchasedQuantity = poItem.orderQuantity;
        stock.status = stock.availableQuantity > 0 ? "Available" : "Issued";
        await stock.save();
      } else {
        await MaterialStock.create({
          organizationId: po.organizationId,
          projectId: po.projectId,
          indentId: po.indentId,
          purchaseOrderId: po._id,
          requesterId: po.requesterId,
          itemId: poItem.itemId,
          unitId: poItem.unitId,
          purchasedQuantity: poItem.orderQuantity,
          receivedQuantity: receivedQty,
          issuedQuantity: 0,
          availableQuantity: receivedQty,
          status: "Available",
        });
      }
    }

    const allReceived = po.items.every(
      (item: any) => Number(item.receivedQuantity) >= Number(item.orderQuantity)
    );

    po.status = allReceived ? "Received" : "PartiallyReceived";

    await po.save();

    const populatedPo = await populatePurchaseOrder(PurchaseOrder.findById(po._id));

    return c.json({
      success: true,
      message: "Purchase order material received successfully",
      data: populatedPo,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const issueMaterialToRequester = async (c: Context) => {
  try {
    const loggedInUser = c.get("user");
    const id = c.req.param("id");

    if (!isValidObjectId(id)) {
      return c.json(
        { success: false, message: "Invalid purchase order id" },
        400
      );
    }

    const po = await PurchaseOrder.findOne({
      _id: id,
      organizationId: loggedInUser.organizationId,
      isActive: true,
    });

    if (!po) {
      return c.json({ success: false, message: "Purchase order not found" }, 404);
    }

    if (!["Received", "PartiallyReceived"].includes(po.status)) {
      return c.json(
        { success: false, message: "Only received material can be issued" },
        400
      );
    }

    for (const item of po.items as any[]) {
      const receivedQty = Number(item.receivedQuantity || 0);
      const indentQty = Number(item.indentQuantity || 0);

      const issueQty = Math.min(receivedQty, indentQty);
      const extraQty = receivedQty - issueQty;

      item.issuedToRequesterQuantity = issueQty;
      item.stockQuantity = extraQty;

      if (extraQty > 0) {
        const stock = await MaterialStock.findOne({
          organizationId: po.organizationId,
          projectId: po.projectId,
          itemId: item.itemId,
          unitId: item.unitId,
          sourceType: "PurchaseOrder",
          sourceId: po._id,
        });

        if (stock) {
          stock.purchasedQuantity += extraQty;
          stock.receivedQuantity += extraQty;
          stock.availableQuantity += extraQty;
          await stock.save();
        } else {
          await MaterialStock.create({
            organizationId: po.organizationId,
            projectId: po.projectId,
            indentId: po.indentId,
            purchaseOrderId: po._id,
            requesterId: po.requesterId,
            itemId: item.itemId,
            unitId: item.unitId,

            purchasedQuantity: extraQty,
            receivedQuantity: extraQty,
            issuedQuantity: 0,
            availableQuantity: extraQty,

            status: "Available",
          });
        }
      }
    }

    po.status = "Issued";
    await po.save();

    const populatedPo = await populatePurchaseOrder(PurchaseOrder.findById(po._id));

    return c.json({
      success: true,
      message: "Material issued to requester and extra material added to stock",
      data: populatedPo,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const getAllPurchaseOrders = async (c: Context) => {
  try {
    const loggedInUser = c.get("user");

    const {
      page = "1",
      limit = "10",
      search = "",
      status,
      projectId,
      indentId,
    } = c.req.query();

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const scopeFilter = await buildPurchaseOrderScopeFilter(loggedInUser);

    const filter: any = {
      ...scopeFilter,
      isActive: true,
    };

    if (status) filter.status = status;

    if (projectId) {
      if (!isValidObjectId(projectId)) {
        return c.json({ success: false, message: "Invalid projectId" }, 400);
      }
      filter.projectId = projectId;
    }

    if (indentId) {
      if (!isValidObjectId(indentId)) {
        return c.json({ success: false, message: "Invalid indentId" }, 400);
      }
      filter.indentId = indentId;
    }

    if (search) {
      filter.$or = [
        { poNo: { $regex: search, $options: "i" } },
        { vendorName: { $regex: search, $options: "i" } },
        { vendorMobile: { $regex: search, $options: "i" } },
      ];
    }

    const [orders, total] = await Promise.all([
      populatePurchaseOrder(
        PurchaseOrder.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNumber)
      ),
      PurchaseOrder.countDocuments(filter),
    ]);

    return c.json({
      success: true,
      count: orders.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      data: orders,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const getPurchaseOrderById = async (c: Context) => {
  try {
    const loggedInUser = c.get("user");
    const id = c.req.param("id");

    if (!isValidObjectId(id)) {
      return c.json(
        { success: false, message: "Invalid purchase order id" },
        400
      );
    }

    const scopeFilter = await buildPurchaseOrderScopeFilter(loggedInUser);

    const po = await populatePurchaseOrder(
      PurchaseOrder.findOne({
        _id: id,
        ...scopeFilter,
        isActive: true,
      })
    );

    if (!po) {
      return c.json({ success: false, message: "Purchase order not found" }, 404);
    }

    return c.json({
      success: true,
      data: po,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const cancelPurchaseOrder = async (c: Context) => {
  try {
    const loggedInUser = c.get("user");
    const id = c.req.param("id");

    if (!isValidObjectId(id)) {
      return c.json(
        { success: false, message: "Invalid purchase order id" },
        400
      );
    }

    const scopeFilter = await buildPurchaseOrderScopeFilter(loggedInUser);

    const po = await PurchaseOrder.findOne({
      _id: id,
      ...scopeFilter,
      isActive: true,
    });

    if (!po) {
      return c.json({ success: false, message: "Purchase order not found" }, 404);
    }

    if (["Received", "Issued"].includes(po.status)) {
      return c.json(
        { success: false, message: "Received or issued PO cannot be cancelled" },
        400
      );
    }

    po.status = "Cancelled";
    await po.save();

    const populatedPo = await populatePurchaseOrder(PurchaseOrder.findById(po._id));

    return c.json({
      success: true,
      message: "Purchase order cancelled successfully",
      data: populatedPo,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};