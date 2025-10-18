import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ApiResponse } from "../types/order";

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): void => {
    const { error } = schema.validate(req.body);

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      res.status(400).json({
        success: false,
        error: message,
      });
      return;
    }

    next();
  };
};

// Validation schemas
export const createOrderSchema = Joi.object({
  swapState: Joi.object({
    fromChain: Joi.number().required(),
    toChain: Joi.number().required(),
    fromToken: Joi.object({
      symbol: Joi.string().required(),
      name: Joi.string().required(),
      address: Joi.string().required(),
      decimals: Joi.number().required(),
      logo: Joi.string().optional(),
    }).required(),
    toToken: Joi.object({
      symbol: Joi.string().required(),
      name: Joi.string().required(),
      address: Joi.string().required(),
      decimals: Joi.number().required(),
      logo: Joi.string().optional(),
    }).required(),
    fromAmount: Joi.string().required(),
    toAmount: Joi.string().required(),
    userAddress: Joi.string().optional(),
  }).required(),
  fromToken: Joi.object({
    symbol: Joi.string().required(),
    name: Joi.string().required(),
    address: Joi.string().required(),
    decimals: Joi.number().required(),
    logo: Joi.string().optional(),
  }).required(),
  toToken: Joi.object({
    symbol: Joi.string().required(),
    name: Joi.string().required(),
    address: Joi.string().required(),
    decimals: Joi.number().required(),
    logo: Joi.string().optional(),
  }).required(),
  orderHash: Joi.string().optional(),
  secret: Joi.string().optional(),
  message: Joi.string().optional(),
  status: Joi.string()
    .valid(
      "CREATED",
      "PENDING_SECRET",
      "PENDING_WITHDRAW",
      "COMPLETED",
      "FAILED"
    )
    .optional(),
  transactions: Joi.object().optional(),
  metadata: Joi.object().optional(),
});

export const updateOrderSchema = Joi.object({
  status: Joi.string()
    .valid(
      "CREATED",
      "PENDING_SECRET",
      "PENDING_WITHDRAW",
      "COMPLETED",
      "FAILED"
    )
    .optional(),
  orderHash: Joi.string().optional(),
  secret: Joi.string().optional(),
  orderFillTxHash: Joi.string().optional(),
  dstEscrowDeployTxHash: Joi.string().optional(),
  dstWithdrawTxHash: Joi.string().optional(),
  srcWithdrawTxHash: Joi.string().optional(),
  orderFillTxLink: Joi.string().optional(),
  dstEscrowDeployTxLink: Joi.string().optional(),
  dstWithdrawTxLink: Joi.string().optional(),
  srcWithdrawTxLink: Joi.string().optional(),
  message: Joi.string().optional(),
  error: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

export const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string()
    .valid(
      "CREATED",
      "PENDING_SECRET",
      "PENDING_WITHDRAW",
      "COMPLETED",
      "FAILED"
    )
    .optional(),
  userAddress: Joi.string().optional(),
  orderHash: Joi.string().optional(),
});
