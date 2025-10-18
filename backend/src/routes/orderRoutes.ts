import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getOrdersByUser,
  getOrderByHash,
} from "../controllers/orderController";
import {
  validateRequest,
  createOrderSchema,
  updateOrderSchema,
  querySchema,
} from "../middleware/validation";

const router = Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Public
router.post("/", validateRequest(createOrderSchema), createOrder);

// @route   GET /api/orders
// @desc    Get all orders with pagination and filtering
// @access  Public
router.get("/", validateRequest(querySchema), getOrders);

// @route   GET /api/orders/user/:address
// @desc    Get orders by user address
// @access  Public
router.get("/user/:address", getOrdersByUser);

// @route   GET /api/orders/hash/:hash
// @desc    Get order by order hash
// @access  Public
router.get("/hash/:hash", getOrderByHash);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Public
router.get("/:id", getOrderById);

// @route   PUT /api/orders/:id
// @desc    Update order by ID
// @access  Public
router.put("/:id", validateRequest(updateOrderSchema), updateOrder);

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Public
router.patch("/:id/status", updateOrderStatus);

// @route   DELETE /api/orders/:id
// @desc    Delete order by ID
// @access  Public
router.delete("/:id", deleteOrder);

export default router;
