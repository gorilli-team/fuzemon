import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Order } from "../models/Order";
import {
  Order as IOrder,
  OrderStatus,
  ApiResponse,
  PaginatedResponse,
} from "../types/order";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
export const createOrder = asyncHandler(
  async (req: Request, res: Response<ApiResponse<IOrder>>) => {
    const orderData = {
      id: uuidv4(),
      createdAt: Date.now(),
      ...req.body,
    };

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      data: order,
      message: "Order created successfully",
    });
  }
);

// @desc    Get all orders with pagination and filtering
// @route   GET /api/orders
// @access  Public
export const getOrders = asyncHandler(
  async (req: Request, res: Response<PaginatedResponse<IOrder>>) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as OrderStatus;
    const userAddress = req.query.userAddress as string;
    const orderHash = req.query.orderHash as string;

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (userAddress) {
      query["swapState.userAddress"] = userAddress;
    }

    if (orderHash) {
      query.orderHash = orderHash;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip).lean(),
      Order.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }
);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = asyncHandler(
  async (req: Request, res: Response<ApiResponse<IOrder>>) => {
    const order = await Order.findOne({ id: req.params.id });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  }
);

// @desc    Update order by ID
// @route   PUT /api/orders/:id
// @access  Public
export const updateOrder = asyncHandler(
  async (req: Request, res: Response<ApiResponse<IOrder>>) => {
    const order = await Order.findOne({ id: req.params.id });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        (order as any)[key] = req.body[key];
      }
    });

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
      message: "Order updated successfully",
    });
  }
);

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Public
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response<ApiResponse<IOrder>>) => {
    const { status, message, error } = req.body;

    const order = await Order.findOne({ id: req.params.id });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    await order.updateStatus(status, message, error);

    res.status(200).json({
      success: true,
      data: order,
      message: "Order status updated successfully",
    });
  }
);

// @desc    Delete order by ID
// @route   DELETE /api/orders/:id
// @access  Public
export const deleteOrder = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const order = await Order.findOne({ id: req.params.id });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    await Order.deleteOne({ id: req.params.id });

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  }
);

// @desc    Get orders by user address
// @route   GET /api/orders/user/:address
// @access  Public
export const getOrdersByUser = asyncHandler(
  async (req: Request, res: Response<PaginatedResponse<IOrder>>) => {
    const { address } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as OrderStatus;

    const query: any = { "swapState.userAddress": address };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip).lean(),
      Order.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }
);

// @desc    Get order by order hash
// @route   GET /api/orders/hash/:hash
// @access  Public
export const getOrderByHash = asyncHandler(
  async (req: Request, res: Response<ApiResponse<IOrder>>) => {
    const order = await Order.findOne({ orderHash: req.params.hash });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  }
);
